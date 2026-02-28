const Game = require('../models/Game')
const User = require('../models/User')
const Transaction = require('../models/Transaction')

// Active games in memory voor snelle real-time toegang
const activeGames = new Map()

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

module.exports = (io, socket) => {
  const { user } = socket

  // ── CREATE GAME ──
  socket.on('game:create', async (config) => {
    try {
      const code = generateCode()
      const game = await Game.create({
        type: config.type,
        code,
        host: user.id,
        players: [{ userId: user.id, username: user.username }],
        buyIn: config.buyIn || 0,
        config,
        status: 'waiting'
      })

      // Bewaar in memory voor real-time
      activeGames.set(code, {
        ...game.toObject(),
        sockets: new Map([[user.id, socket.id]])
      })

      socket.join(code)
      socket.emit('game:created', { code, game })
      console.log(`🎮 Game ${code} created by ${user.username} (${config.type})`)
    } catch (e) {
      console.error('game:create error:', e)
      socket.emit('error', 'Kon game niet aanmaken')
    }
  })

  // ── JOIN GAME ──
  socket.on('game:join', async (code) => {
    try {
      const game = activeGames.get(code.toUpperCase())
      if (!game) return socket.emit('error', 'Game niet gevonden')
      if (game.status !== 'waiting') return socket.emit('error', 'Game is al gestart')

      // Check of speler al in game zit
      const alreadyIn = game.players.find(p => p.userId.toString() === user.id)
      if (alreadyIn) return socket.emit('error', 'Je zit al in deze game')

      // Check buy-in
      if (game.buyIn > 0) {
        const dbUser = await User.findById(user.id)
        if (dbUser.wallet < game.buyIn) return socket.emit('error', 'Niet genoeg coins')
        dbUser.wallet -= game.buyIn
        await dbUser.save()

        await Transaction.create({
          userId: user.id,
          type: 'buy-in',
          amount: -game.buyIn,
          description: `Buy-in voor game ${code}`,
          status: 'confirmed'
        })
      }

      game.players.push({ userId: user.id, username: user.username })
      game.sockets.set(user.id, socket.id)

      socket.join(code)
      io.to(code).emit('game:player-joined', {
        players: game.players,
        username: user.username
      })
      console.log(`👤 ${user.username} joined game ${code}`)
    } catch (e) {
      console.error('game:join error:', e)
      socket.emit('error', 'Kon niet joinen')
    }
  })

  // ── START GAME ──
  socket.on('game:start', async (code) => {
    try {
      const game = activeGames.get(code)
      if (!game) return
      if (game.host.toString() !== user.id) return socket.emit('error', 'Alleen de host kan starten')
      if (game.players.length < 2) return socket.emit('error', 'Minimaal 2 spelers nodig')

      game.status = 'active'
      game.prizePool = game.buyIn * game.players.length

      await Game.findOneAndUpdate({ code }, { status: 'active', prizePool: game.prizePool })

      io.to(code).emit('game:started', {
        type: game.type,
        players: game.players,
        config: game.config,
        prizePool: game.prizePool
      })
      console.log(`🏁 Game ${code} started! (${game.players.length} players, pool: ${game.prizePool})`)
    } catch (e) {
      console.error('game:start error:', e)
    }
  })

  // ── GAME ACTION (per game type) ──
  socket.on('game:action', (data) => {
    const { code, action, payload } = data
    const game = activeGames.get(code)
    if (!game) return

    // Broadcast naar alle spelers
    io.to(code).emit('game:action', {
      player: user.username,
      playerId: user.id,
      action,
      payload
    })
  })

  // ── GAME END ──
  socket.on('game:end', async (data) => {
    try {
      const { code, winnerId, winnerUsername } = data
      const game = activeGames.get(code)
      if (!game) return

      game.status = 'finished'

      // Uitbetalen
      if (game.prizePool > 0 && winnerId) {
        const winner = await User.findById(winnerId)
        if (winner) {
          winner.wallet += game.prizePool
          winner.stats.wins += 1
          winner.stats.totalEarnings += game.prizePool
          await winner.save()

          await Transaction.create({
            userId: winnerId,
            type: 'winnings',
            amount: game.prizePool,
            description: `Gewonnen in game ${code}`,
            status: 'confirmed'
          })
        }
      }

      // Update stats voor alle spelers
      for (const p of game.players) {
        await User.findByIdAndUpdate(p.userId, { $inc: { 'stats.gamesPlayed': 1 } })
      }

      // Update DB
      await Game.findOneAndUpdate({ code }, {
        status: 'finished',
        result: { winnerId, winnerUsername },
        finishedAt: new Date()
      })

      io.to(code).emit('game:ended', {
        winner: winnerUsername,
        prizePool: game.prizePool
      })

      // Cleanup
      activeGames.delete(code)
      console.log(`🏆 Game ${code} finished! Winner: ${winnerUsername} (+${game.prizePool} coins)`)
    } catch (e) {
      console.error('game:end error:', e)
    }
  })

  // ── CHAT ──
  socket.on('chat:message', (data) => {
    io.to(data.code).emit('chat:message', {
      username: user.username,
      message: data.message,
      timestamp: Date.now()
    })
  })

  // ── LIST ACTIVE GAMES ──
  socket.on('games:list', () => {
    const games = []
    activeGames.forEach((game, code) => {
      if (game.status === 'waiting') {
        games.push({
          code,
          type: game.type,
          host: game.players[0]?.username,
          playerCount: game.players.length,
          buyIn: game.buyIn,
          maxPlayers: game.config?.maxPlayers || 8
        })
      }
    })
    socket.emit('games:list', games)
  })

  // ── DISCONNECT ──
  socket.on('disconnect', () => {
    console.log(`💤 ${user.username} disconnected`)
    activeGames.forEach((game, code) => {
      if (game.sockets.has(user.id)) {
        game.sockets.delete(user.id)
        io.to(code).emit('game:player-disconnected', { username: user.username })

        // Als host disconnect en game nog niet gestart, verwijder game
        if (game.host.toString() === user.id && game.status === 'waiting') {
          // Refund buy-ins
          if (game.buyIn > 0) {
            game.players.forEach(async (p) => {
              if (p.userId.toString() !== user.id) {
                await User.findByIdAndUpdate(p.userId, { $inc: { wallet: game.buyIn } })
                await Transaction.create({
                  userId: p.userId,
                  type: 'refund',
                  amount: game.buyIn,
                  description: `Refund: host left game ${code}`,
                  status: 'confirmed'
                })
              }
            })
          }
          activeGames.delete(code)
          Game.findOneAndUpdate({ code }, { status: 'finished' }).catch(() => {})
          io.to(code).emit('game:cancelled', { reason: 'Host heeft de game verlaten' })
        }
      }
    })
  })
}

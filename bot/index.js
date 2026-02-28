require('dotenv').config()
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')
const mongoose = require('mongoose')

// Gebruik dezelfde models als de server
// Models worden hier opnieuw gedefinieerd zodat de bot standalone kan draaien
const bcrypt = require('bcryptjs') // not used in bot but needed for User model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  wallet: { type: Number, default: 1000 },
  discordId: { type: String, default: null },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now }
})
const User = mongoose.model('User', userSchema)

const txSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'buy-in', 'winnings', 'bounty', 'refund'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})
const Transaction = mongoose.model('Transaction', txSchema)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

const PREFIX = '!'

client.on('ready', () => {
  console.log(`🤖 Bot online als ${client.user.tag}`)
  client.user.setActivity('The69Army Arena', { type: 3 })
})

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(PREFIX)) return

  const args = msg.content.slice(1).trim().split(/\s+/)
  const cmd = args.shift().toLowerCase()

  // ═══ !link <username> — Link Discord aan arena account ═══
  if (cmd === 'link') {
    const arenaName = args[0]
    if (!arenaName) return msg.reply('❌ Gebruik: `!link <arena-username>`')

    const user = await User.findOne({ username: arenaName.toLowerCase() })
    if (!user) return msg.reply('❌ Account niet gevonden. Registreer eerst op de website.')

    if (user.discordId && user.discordId !== msg.author.id) {
      return msg.reply('❌ Dit account is al aan een ander Discord account gelinkt.')
    }

    user.discordId = msg.author.id
    await user.save()

    const embed = new EmbedBuilder()
      .setTitle('🔗 Account Gelinkt!')
      .setColor(0x00ff6a)
      .addFields(
        { name: 'Discord', value: msg.author.toString(), inline: true },
        { name: 'Arena', value: user.username, inline: true },
        { name: 'Balance', value: `${user.wallet.toLocaleString()} coins`, inline: true },
      )
    msg.reply({ embeds: [embed] })
  }

  // ═══ !deposit ═══
  if (cmd === 'deposit') {
    const amount = parseInt(args[0])
    if (!amount || amount < 100) {
      return msg.reply('❌ Gebruik: `!deposit <bedrag>` (min. 100)')
    }

    let user = await User.findOne({ discordId: msg.author.id })
    if (!user) {
      return msg.reply('❌ Je hebt nog geen account gelinkt. Gebruik eerst `!link <username>`')
    }

    // Maak ticket channel
    if (process.env.TICKET_CATEGORY_ID) {
      try {
        const ticketChannel = await msg.guild.channels.create({
          name: `deposit-${msg.author.username}-${Date.now()}`.slice(0, 100),
          type: ChannelType.GuildText,
          parent: process.env.TICKET_CATEGORY_ID,
          permissionOverwrites: [
            { id: msg.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: msg.author.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            ...(process.env.ADMIN_ROLE_ID ? [
              { id: process.env.ADMIN_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ] : []),
          ]
        })

        const tx = await Transaction.create({
          userId: user._id,
          type: 'deposit',
          amount,
          description: `Discord deposit by ${msg.author.username}`,
          status: 'pending'
        })

        const embed = new EmbedBuilder()
          .setTitle('💰 Deposit Request')
          .setColor(0x00ff6a)
          .addFields(
            { name: 'Player', value: msg.author.toString(), inline: true },
            { name: 'Amount', value: `${amount.toLocaleString()} coins`, inline: true },
            { name: 'TX ID', value: tx._id.toString() },
            { name: 'Status', value: '⏳ Wacht op admin bevestiging' },
          )
          .setTimestamp()

        await ticketChannel.send({ embeds: [embed] })
        if (process.env.ADMIN_ROLE_ID) {
          await ticketChannel.send(`<@&${process.env.ADMIN_ROLE_ID}> — Nieuwe deposit request!`)
        }
        msg.reply(`✅ Ticket aangemaakt: ${ticketChannel}`)
      } catch (e) {
        console.error('Ticket create error:', e)
        msg.reply('❌ Kon geen ticket aanmaken. Check bot permissions.')
      }
    } else {
      // Geen ticket systeem, gewoon loggen
      const tx = await Transaction.create({
        userId: user._id,
        type: 'deposit',
        amount,
        description: `Discord deposit by ${msg.author.username}`,
        status: 'pending'
      })
      msg.reply(`✅ Deposit request aangemaakt (TX: ${tx._id}). Een admin zal dit bevestigen.`)
    }
  }

  // ═══ !confirm @user <bedrag> (admin only) ═══
  if (cmd === 'confirm') {
    if (process.env.ADMIN_ROLE_ID && !msg.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
      return msg.reply('❌ Alleen admins kunnen deposits bevestigen')
    }

    const targetUser = msg.mentions.users.first()
    const amount = parseInt(args[1])
    if (!targetUser || !amount) {
      return msg.reply('❌ Gebruik: `!confirm @user <bedrag>`')
    }

    const user = await User.findOne({ discordId: targetUser.id })
    if (!user) return msg.reply('❌ User niet gevonden')

    user.wallet += amount
    await user.save()

    await Transaction.findOneAndUpdate(
      { userId: user._id, type: 'deposit', status: 'pending' },
      { status: 'confirmed' },
      { sort: { createdAt: -1 } }
    )

    const embed = new EmbedBuilder()
      .setTitle('✅ Deposit Confirmed')
      .setColor(0x00ff6a)
      .addFields(
        { name: 'Player', value: targetUser.toString(), inline: true },
        { name: 'Amount', value: `+${amount.toLocaleString()} coins`, inline: true },
        { name: 'New Balance', value: `${user.wallet.toLocaleString()} coins` },
      )
    msg.reply({ embeds: [embed] })
  }

  // ═══ !balance ═══
  if (cmd === 'balance' || cmd === 'bal') {
    const user = await User.findOne({ discordId: msg.author.id })
    if (!user) return msg.reply('❌ Account niet gelinkt. Gebruik `!link <username>`')

    const embed = new EmbedBuilder()
      .setTitle('💳 Wallet Balance')
      .setColor(0x00ff6a)
      .addFields(
        { name: 'Balance', value: `${user.wallet.toLocaleString()} coins`, inline: true },
        { name: 'Games Won', value: `${user.stats.wins}`, inline: true },
      )
    msg.reply({ embeds: [embed] })
  }

  // ═══ !stats ═══
  if (cmd === 'stats') {
    const target = msg.mentions.users.first() || msg.author
    const user = await User.findOne({ discordId: target.id })
    if (!user) return msg.reply('❌ User niet gevonden')

    const embed = new EmbedBuilder()
      .setTitle(`📈 Stats — ${user.username}`)
      .setColor(0x00ff6a)
      .addFields(
        { name: 'Games Played', value: `${user.stats.gamesPlayed}`, inline: true },
        { name: 'Wins', value: `${user.stats.wins}`, inline: true },
        { name: 'Earnings', value: `${user.stats.totalEarnings.toLocaleString()} coins`, inline: true },
        { name: 'Win Rate', value: user.stats.gamesPlayed > 0
          ? `${((user.stats.wins / user.stats.gamesPlayed) * 100).toFixed(1)}%`
          : 'N/A', inline: true },
      )
    msg.reply({ embeds: [embed] })
  }

  // ═══ !leaderboard ═══
  if (cmd === 'leaderboard' || cmd === 'lb') {
    const top = await User.find().sort({ 'stats.wins': -1 }).limit(10)
    const lines = top.map((u, i) =>
      `${i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`} **${u.username}** — ${u.stats.wins} wins (${u.stats.totalEarnings.toLocaleString()} earned)`
    )

    const embed = new EmbedBuilder()
      .setTitle('🏆 Leaderboard')
      .setColor(0xffd700)
      .setDescription(lines.join('\n') || 'Nog geen spelers...')
    msg.reply({ embeds: [embed] })
  }

  // ═══ !help ═══
  if (cmd === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('🎮 The69Army Arena — Commands')
      .setColor(0x00ff6a)
      .setDescription([
        '`!link <username>` — Link je Discord aan je arena account',
        '`!balance` / `!bal` — Check je wallet',
        '`!deposit <bedrag>` — Vraag een deposit aan',
        '`!stats [@user]` — Bekijk stats',
        '`!leaderboard` / `!lb` — Top 10 spelers',
        '',
        '**Admin:**',
        '`!confirm @user <bedrag>` — Bevestig een deposit',
      ].join('\n'))
    msg.reply({ embeds: [embed] })
  }
})

// ── Connect DB & login ──
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/the69army'

mongoose.connect(MONGO)
  .then(() => {
    console.log('✅ Bot: MongoDB connected')
    if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'jouw-bot-token-hier') {
      console.log('⚠️  Geen Discord token geconfigureerd. Bot wordt niet gestart.')
      console.log('   Vul DISCORD_TOKEN in bot/.env om de bot te activeren.')
      return
    }
    return client.login(process.env.DISCORD_TOKEN)
  })
  .catch(err => {
    console.error('❌ Bot error:', err.message)
  })

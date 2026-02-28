const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Transaction = require('../models/Transaction')

// ── Auth middleware ──
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Balance ──
router.get('/balance', auth, async (req, res) => {
  const user = await User.findById(req.user.id)
  res.json({ balance: user.wallet })
})

// ── Transaction history ──
router.get('/history', auth, async (req, res) => {
  const txs = await Transaction.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
  res.json(txs)
})

// ── Deposit request ──
router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body
  if (!amount || amount < 100) return res.status(400).json({ error: 'Minimum 100 coins' })

  const tx = await Transaction.create({
    userId: req.user.id,
    type: 'deposit',
    amount,
    description: 'Deposit request via website',
    status: 'pending'
  })

  // Discord webhook notificatie
  if (process.env.DISCORD_WEBHOOK_URL) {
    fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '💰 Deposit Request',
          color: 0x00ff6a,
          fields: [
            { name: 'Player', value: req.user.username, inline: true },
            { name: 'Amount', value: amount.toLocaleString() + ' coins', inline: true },
            { name: 'TX ID', value: tx._id.toString() },
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(console.error)
  }

  res.json({ tx, message: 'Deposit request aangemaakt' })
})

// ── Withdraw request ──
router.post('/withdraw', auth, async (req, res) => {
  const { amount } = req.body
  if (!amount || amount < 100) return res.status(400).json({ error: 'Minimum 100 coins' })

  const user = await User.findById(req.user.id)
  if (user.wallet < amount) return res.status(400).json({ error: 'Niet genoeg coins' })

  const tx = await Transaction.create({
    userId: req.user.id,
    type: 'withdraw',
    amount,
    description: 'Withdraw request via website',
    status: 'pending'
  })

  res.json({ tx, message: 'Withdraw request aangemaakt — wacht op admin goedkeuring' })
})

// ── Leaderboard ──
router.get('/leaderboard', async (req, res) => {
  const top = await User.find()
    .select('username stats')
    .sort({ 'stats.wins': -1 })
    .limit(20)
  res.json(top)
})

module.exports = router

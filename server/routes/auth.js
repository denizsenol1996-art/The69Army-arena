const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ── Register ──
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Username en password zijn verplicht' })
    if (username.length < 3) return res.status(400).json({ error: 'Username moet minimaal 3 tekens zijn' })
    if (password.length < 4) return res.status(400).json({ error: 'Password moet minimaal 4 tekens zijn' })

    const exists = await User.findOne({ username: username.toLowerCase() })
    if (exists) return res.status(400).json({ error: 'Username is al bezet' })

    const user = await User.create({ username: username.toLowerCase(), password })
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: { id: user._id, username: user.username, wallet: user.wallet, stats: user.stats }
    })
  } catch (e) {
    console.error('Register error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Login ──
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username: username.toLowerCase() })
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Ongeldige inloggegevens' })
    }
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: { id: user._id, username: user.username, wallet: user.wallet, stats: user.stats }
    })
  } catch (e) {
    console.error('Login error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Me (huidige user ophalen via token) ──
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({
      user: { id: user._id, username: user.username, wallet: user.wallet, stats: user.stats }
    })
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router

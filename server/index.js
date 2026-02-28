require('dotenv').config()
const path = require('path')
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())

let authRoutes, walletRoutes, socketHandler

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() })
})

const clientDist = path.join(__dirname, '..', 'client', 'dist')
app.use(express.static(clientDist))

io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) return next(new Error('No token'))
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (e) {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  console.log('  [socket] ' + socket.user.username + ' connected')
  if (socketHandler) socketHandler(io, socket)
})

async function startDatabase() {
  const uri = process.env.MONGODB_URI || ''

  if (uri && !uri.includes('localhost')) {
    try {
      await mongoose.connect(uri)
      console.log('  [db] Connected to MongoDB (' + uri.split('@')[1]?.split('/')[0] + ')')
      return
    } catch (e) {
      console.log('  [db] External MongoDB failed, trying fallback...')
    }
  }

  try {
    await mongoose.connect('mongodb://localhost:27017/the69army', {
      serverSelectionTimeoutMS: 2000
    })
    console.log('  [db] Connected to local MongoDB')
    return
  } catch (e) {}

  console.log('  [db] No MongoDB found — starting built-in memory server...')
  console.log('  [db] (eerste keer duurt 1-2 min voor download, daarna instant)')
  const { MongoMemoryServer } = require('mongodb-memory-server')
  const mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  console.log('  [db] In-memory MongoDB running!')
  console.log('  [db] LET OP: data verdwijnt bij server restart.')
}

async function start() {
  console.log('')
  console.log('  ========================================')
  console.log('   THE69ARMY GAMING ARENA')
  console.log('  ========================================')
  console.log('')

  await startDatabase()

  authRoutes = require('./routes/auth')
  walletRoutes = require('./routes/wallet')
  socketHandler = require('./socket/handler')
  app.use('/api/auth', authRoutes)
  app.use('/api/wallet', walletRoutes)

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      const idx = path.join(clientDist, 'index.html')
      require('fs').existsSync(idx) ? res.sendFile(idx) : res.status(200).send('Frontend not built. Run: cd client && npm run build')
    }
  })

  const PORT = process.env.PORT || 4000
  server.listen(PORT, () => {
    console.log('')
    console.log('  Server:  http://localhost:' + PORT)
    console.log('  Health:  http://localhost:' + PORT + '/api/health')
    console.log('')
  })
}

start().catch(err => { console.error('  [FATAL]', err.message); process.exit(1) })

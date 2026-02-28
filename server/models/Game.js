const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
  type: { type: String, required: true },
  code: { type: String, unique: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    placement: Number
  }],
  buyIn: { type: Number, default: 0 },
  prizePool: { type: Number, default: 0 },
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  config: { type: Object, default: {} },
  result: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  finishedAt: { type: Date, default: null }
})

module.exports = mongoose.model('Game', gameSchema)

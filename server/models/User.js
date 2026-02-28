const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true, minlength: 3 },
  password: { type: String, required: true },
  wallet: { type: Number, default: 1000 }, // Start coins voor testing
  discordId: { type: String, default: null },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now }
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.checkPassword = function (pw) {
  return bcrypt.compare(pw, this.password)
}

module.exports = mongoose.model('User', userSchema)

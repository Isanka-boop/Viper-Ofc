const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    jid: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    isBanned: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    warnings: { type: Number, default: 0 },
    commandsUsed: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    language: { type: String, default: 'en' },
    registeredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

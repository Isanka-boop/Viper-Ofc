const mongoose = require('mongoose');

const pairSessionSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    method: { type: String, enum: ['qr', 'code'], required: true },
    number: { type: String, default: '' },
    code: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'connected', 'expired', 'failed'],
      default: 'pending'
    },
    ip: { type: String, default: '' },
    connectedJid: { type: String, default: '' },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PairSession', pairSessionSchema);

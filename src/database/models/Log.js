const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // command | error | connection | pairing
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
  }
);

logSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);


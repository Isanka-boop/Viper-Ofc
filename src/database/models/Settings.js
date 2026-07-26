const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, index: true }, // 'global' or a group jid
    prefix: { type: String, default: '.' },
    antilink: { type: Boolean, default: false },
    antidelete: { type: Boolean, default: false },
    welcome: { type: Boolean, default: true },
    goodbye: { type: Boolean, default: true },
    welcomeMessage: { type: String, default: 'Welcome {user} to {group}' },
    goodbyeMessage: { type: String, default: 'Goodbye {user}, we will miss you' },
    autoRead: { type: Boolean, default: false },
    autoReact: { type: Boolean, default: false },
    autoReactEmoji: { type: String, default: 'PLUS_ONE' },
    onlyAdmins: { type: Boolean, default: false },
    language: { type: String, default: 'en' }
  },
  { timestamps: true }
);

settingsSchema.index({ scope: 1 }, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema);

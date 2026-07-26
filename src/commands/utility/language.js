const Settings = require('../../database/models/Settings');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'language',
  aliases: ['lang'],
  category: 'utility',
  description: 'View or set your preferred language code. Usage: language <code>',
  async execute({ sock, remoteJid, sender, args, msg }) {
    const User = require('../../database/models/User');
    if (!args[0]) {
      const user = await User.findOne({ jid: sender }).lean();
      return reply(sock, remoteJid, `Your language is set to: ${user?.language || 'en'}`, msg);
    }
    await User.findOneAndUpdate({ jid: sender }, { $set: { language: args[0] } }, { upsert: true });
    await reply(sock, remoteJid, `Language preference updated to: ${args[0]}`, msg);
  }
};

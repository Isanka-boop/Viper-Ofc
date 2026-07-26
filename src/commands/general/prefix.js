const Settings = require('../../database/models/Settings');
const config = require('../../config/config');
const { reply, isOwner } = require('../../lib/commandHelpers');

module.exports = {
  name: 'prefix',
  aliases: [],
  category: 'general',
  description: 'View or change the bot command prefix (owner only to change)',
  async execute({ sock, remoteJid, sender, args, msg }) {
    if (!args[0]) {
      return reply(sock, remoteJid, `Current prefix: ${config.bot.prefix}`, msg);
    }
    if (!isOwner(sender)) {
      return reply(sock, remoteJid, 'Only the bot owner can change the prefix.', msg);
    }
    await Settings.findOneAndUpdate(
      { scope: 'global' },
      { $set: { prefix: args[0] } },
      { upsert: true }
    );
    await reply(sock, remoteJid, `Prefix updated to: ${args[0]}\nNote: restart required for full effect.`, msg);
  }
};

const { reply, isOwner } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');

module.exports = {
  name: 'listbanned',
  aliases: [],
  category: 'owner',
  description: 'List all banned users (owner only)',
  async execute({ sock, remoteJid, sender, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    const banned = await User.find({ isBanned: true }).select('jid').lean();
    if (!banned.length) return reply(sock, remoteJid, 'No banned users.', msg);
    const text = 'Banned users:\n' + banned.map((u) => u.jid.split('@')[0]).join('\n');
    await reply(sock, remoteJid, text, msg);
  }
};

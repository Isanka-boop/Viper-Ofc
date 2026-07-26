const { reply, isOwner } = require('../../lib/commandHelpers');
const PairSession = require('../../database/models/PairSession');

module.exports = {
  name: 'pairhistory',
  aliases: [],
  category: 'utility',
  description: 'View recent pairing history (owner only)',
  async execute({ sock, remoteJid, sender, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    const sessions = await PairSession.find().sort({ createdAt: -1 }).limit(10).lean();

    if (!sessions.length) return reply(sock, remoteJid, 'No pairing history found.', msg);

    const text = sessions
      .map((s) => `${s.method.toUpperCase()} | ${s.status} | ${new Date(s.createdAt).toLocaleString()}`)
      .join('\n');

    await reply(sock, remoteJid, `Recent pairing sessions:\n\n${text}`, msg);
  }
};

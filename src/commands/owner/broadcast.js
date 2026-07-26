const config = require('../../config/config');
const { reply, isOwner } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');

module.exports = {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  description: 'Broadcast a message to all known users (owner only)',
  async execute({ sock, remoteJid, sender, args, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    if (!args.length) return reply(sock, remoteJid, `Usage: ${config.bot.prefix}broadcast <message>`, msg);

    const text = args.join(' ');
    const users = await User.find({ isBanned: false }).select('jid').lean();

    let sent = 0;
    for (const u of users) {
      await sock.sendMessage(u.jid, { text: `Broadcast message:\n\n${text}\n\n${config.branding.footer}` }).catch(() => {});
      sent += 1;
      await new Promise((r) => setTimeout(r, 250));
    }

    await reply(sock, remoteJid, `Broadcast sent to ${sent} users.`, msg);
  }
};

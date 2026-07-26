const { reply, isGroupAdmin } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');

module.exports = {
  name: 'warn',
  aliases: [],
  category: 'group',
  description: 'Warn a member. Three warnings recommends removal (admin only)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentioned) return reply(sock, remoteJid, 'Mention the member to warn.', msg);

    const user = await User.findOneAndUpdate({ jid: mentioned }, { $inc: { warnings: 1 } }, { upsert: true, new: true });
    await sock.sendMessage(remoteJid, {
      text: `@${mentioned.split('@')[0]} has been warned. Total warnings: ${user.warnings}/3`,
      mentions: [mentioned]
    }, { quoted: msg });
  }
};

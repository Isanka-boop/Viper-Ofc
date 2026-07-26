const { reply, isGroupAdmin } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');

module.exports = {
  name: 'resetwarn',
  aliases: [],
  category: 'group',
  description: 'Reset warnings for a member (admin only)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentioned) return reply(sock, remoteJid, 'Mention the member to reset warnings for.', msg);

    await User.findOneAndUpdate({ jid: mentioned }, { $set: { warnings: 0 } }, { upsert: true });
    await reply(sock, remoteJid, `Warnings reset for @${mentioned.split('@')[0]}`, msg);
  }
};

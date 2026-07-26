const { reply, isGroupAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'invitelink',
  aliases: ['glink'],
  category: 'group',
  description: 'Get the group invite link (admin only)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);

    const code = await sock.groupInviteCode(remoteJid);
    await reply(sock, remoteJid, `https://chat.whatsapp.com/${code}`, msg);
  }
};

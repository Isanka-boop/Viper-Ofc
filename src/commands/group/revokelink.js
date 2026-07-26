const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'revokelink',
  aliases: ['resetlink'],
  category: 'group',
  description: 'Revoke and regenerate the group invite link (admin only)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);

    const code = await sock.groupRevokeInvite(remoteJid);
    await reply(sock, remoteJid, `Invite link reset. New link: https://chat.whatsapp.com/${code}`, msg);
  }
};

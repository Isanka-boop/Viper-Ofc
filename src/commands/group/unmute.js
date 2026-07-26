const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'unmute',
  aliases: [],
  category: 'group',
  description: 'Allow all members to send messages again (alias of unlock)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);

    await sock.groupSettingUpdate(remoteJid, 'not_announcement');
    await reply(sock, remoteJid, 'Group unmuted. All members can send messages.', msg);
  }
};

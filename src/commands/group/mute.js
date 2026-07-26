const Settings = require('../../database/models/Settings');
const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'mute',
  aliases: [],
  category: 'group',
  description: 'Restrict only admins from sending messages (alias of lock)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);

    await sock.groupSettingUpdate(remoteJid, 'announcement');
    await reply(sock, remoteJid, 'Group muted. Only admins can send messages.', msg);
  }
};

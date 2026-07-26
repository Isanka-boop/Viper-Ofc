const { reply, isGroupAdmin, isOwner } = require('../../lib/commandHelpers');

module.exports = {
  name: 'leave',
  aliases: ['leavegroup'],
  category: 'group',
  description: 'Make the bot leave the current group (admin or owner only)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender)) && !isOwner(sender)) {
      return reply(sock, remoteJid, 'Only group admins or the bot owner can use this command.', msg);
    }
    await reply(sock, remoteJid, 'Goodbye. Leaving the group now.', msg);
    await sock.groupLeave(remoteJid);
  }
};

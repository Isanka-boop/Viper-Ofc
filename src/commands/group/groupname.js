const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'groupname',
  aliases: ['setname'],
  category: 'group',
  description: 'Change the group name (admin only)',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);
    if (!args.length) return reply(sock, remoteJid, 'Provide a new group name.', msg);

    await sock.groupUpdateSubject(remoteJid, args.join(' '));
    await reply(sock, remoteJid, 'Group name updated.', msg);
  }
};

const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'add',
  aliases: [],
  category: 'group',
  description: 'Add a member to the group by number (admin only)',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);
    if (!args[0]) return reply(sock, remoteJid, 'Provide a phone number to add.', msg);

    const jid = `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    await sock.groupParticipantsUpdate(remoteJid, [jid], 'add');
    await reply(sock, remoteJid, 'Member added successfully.', msg);
  }
};


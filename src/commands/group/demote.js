const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'demote',
  aliases: [],
  category: 'group',
  description: 'Demote an admin to regular member',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || !mentioned.length) return reply(sock, remoteJid, 'Mention the admin to demote.', msg);

    await sock.groupParticipantsUpdate(remoteJid, mentioned, 'demote');
    await reply(sock, remoteJid, 'Admin demoted to member.', msg);
  }
};

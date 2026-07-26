const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'setppgroup',
  aliases: ['setgrouppic'],
  category: 'group',
  description: 'Set the group profile picture from a quoted image (admin only)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    if (!quoted) return reply(sock, remoteJid, 'Reply to an image with this command.', msg);

    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    await sock.updateProfilePicture(remoteJid, buffer);
    await reply(sock, remoteJid, 'Group profile picture updated.', msg);
  }
};

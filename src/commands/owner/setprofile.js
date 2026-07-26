const { reply, isOwner } = require('../../lib/commandHelpers');

module.exports = {
  name: 'setprofile',
  aliases: ['setpp'],
  category: 'owner',
  description: 'Update the bot profile picture from a quoted image (owner only)',
  async execute({ sock, remoteJid, sender, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage) return reply(sock, remoteJid, 'Reply to an image with this command.', msg);

    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    await sock.updateProfilePicture(sock.user.id, buffer);
    await reply(sock, remoteJid, 'Bot profile picture updated successfully.', msg);
  }
};

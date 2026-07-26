const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'toimg',
  aliases: ['simg'],
  category: 'sticker',
  description: 'Convert a quoted sticker back into an image',
  async execute({ sock, remoteJid, msg }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
    if (!quoted) return reply(sock, remoteJid, 'Reply to a sticker with this command.', msg);

    const stream = await downloadContentFromMessage(quoted, 'sticker');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const png = await sharp(buffer).png().toBuffer();
    await sock.sendMessage(remoteJid, { image: png, caption: 'Converted to image' }, { quoted: msg });
  }
};

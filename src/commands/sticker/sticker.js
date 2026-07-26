const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'sticker',
  description: 'Convert a quoted or sent image/video into a sticker',
  async execute({ sock, remoteJid, msg }) {
    const target = msg.message?.imageMessage
      ? msg.message.imageMessage
      : msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

    if (!target) return reply(sock, remoteJid, 'Send or reply to an image with this command to create a sticker.', msg);

    const stream = await downloadContentFromMessage(target, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const webp = await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toBuffer();

    await sock.sendMessage(remoteJid, { sticker: webp }, { quoted: msg });
  }
};


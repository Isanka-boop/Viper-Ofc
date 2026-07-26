const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'resize',
  aliases: [],
  category: 'converter',
  description: 'Resize a quoted image. Usage: resize <width> <height>',
  async execute({ sock, remoteJid, args, msg }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || msg.message?.imageMessage;
    if (!quoted) return reply(sock, remoteJid, 'Send or reply to an image with this command.', msg);

    const width = parseInt(args[0], 10) || 512;
    const height = parseInt(args[1], 10) || 512;

    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const output = await sharp(buffer).resize(width, height).toBuffer();
    await sock.sendMessage(remoteJid, { image: output }, { quoted: msg });
  }
};

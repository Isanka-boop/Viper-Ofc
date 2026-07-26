const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'sepia',
  aliases: [],
  category: 'converter',
  description: 'Apply a sepia tone to a quoted image',
  async execute({ sock, remoteJid, msg }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || msg.message?.imageMessage;
    if (!quoted) return reply(sock, remoteJid, 'Send or reply to an image with this command.', msg);

    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const output = await sharp(buffer)
      .modulate({ saturation: 0.3 })
      .tint({ r: 112, g: 66, b: 20 })
      .toBuffer();

    await sock.sendMessage(remoteJid, { image: output }, { quoted: msg });
  }
};

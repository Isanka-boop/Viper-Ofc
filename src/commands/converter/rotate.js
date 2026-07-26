const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'rotate',
  aliases: [],
  category: 'converter',
  description: 'Rotate a quoted image. Usage: rotate <degrees>',
  async execute({ sock, remoteJid, args, msg }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || msg.message?.imageMessage;
    if (!quoted) return reply(sock, remoteJid, 'Send or reply to an image with this command.', msg);

    const degrees = parseInt(args[0], 10) || 90;

    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const output = await sharp(buffer).rotate(degrees).toBuffer();
    await sock.sendMessage(remoteJid, { image: output }, { quoted: msg });
  }
};

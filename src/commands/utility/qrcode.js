const QRCode = require('qrcode');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'qrcode',
  aliases: ['qrmake'],
  category: 'utility',
  description: 'Generate a QR code from text',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Provide text to encode as a QR code.', msg);
    const buffer = await QRCode.toBuffer(args.join(' '), { width: 512 });
    await sock.sendMessage(remoteJid, { image: buffer, caption: 'QR code generated' }, { quoted: msg });
  }
};

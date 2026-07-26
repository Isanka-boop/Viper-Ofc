const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'base64decode',
  aliases: ['b64decode'],
  category: 'utility',
  description: 'Decode a base64 string',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Provide base64 text to decode.', msg);
    try {
      const decoded = Buffer.from(args.join(' '), 'base64').toString('utf-8');
      await reply(sock, remoteJid, decoded, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Invalid base64 string.', msg);
    }
  }
};


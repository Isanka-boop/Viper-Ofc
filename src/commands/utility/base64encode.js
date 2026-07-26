const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'base64encode',
  aliases: ['b64encode'],
  category: 'utility',
  description: 'Encode text into base64',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Provide text to encode.', msg);
    const encoded = Buffer.from(args.join(' ')).toString('base64');
    await reply(sock, remoteJid, encoded, msg);
  }
};

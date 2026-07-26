const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'reverse',
  aliases: [],
  category: 'fun',
  description: 'Reverse the given text',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Provide text to reverse.', msg);
    const reversed = args.join(' ').split('').reverse().join('');
    await reply(sock, remoteJid, reversed, msg);
  }
};

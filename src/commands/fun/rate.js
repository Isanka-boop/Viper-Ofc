const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'rate',
  aliases: [],
  category: 'fun',
  description: 'Get a random rating out of 10 for anything. Usage: rate <thing>',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: rate <thing>', msg);
    const score = (Math.random() * 10).toFixed(1);
    await reply(sock, remoteJid, `I would rate "${args.join(' ')}" a solid ${score}/10`, msg);
  }
};

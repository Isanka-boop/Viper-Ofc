const { reply } = require('../../lib/commandHelpers');

const answers = [
  'Yes, definitely.', 'No, not likely.', 'Ask again later.',
  'It is certain.', 'Very doubtful.', 'Signs point to yes.',
  'Cannot predict now.', 'Absolutely not.'
];

module.exports = {
  name: '8ball',
  aliases: ['magicball'],
  category: 'fun',
  description: 'Ask the magic 8 ball a question',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Ask a question first.', msg);
    const answer = answers[Math.floor(Math.random() * answers.length)];
    await reply(sock, remoteJid, answer, msg);
  }
};


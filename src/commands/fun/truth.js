const truths = [
  'What is your biggest fear',
  'What is the most embarrassing thing that happened to you',
  'What is a secret you have never told anyone',
  'What is your biggest regret'
];
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'truth',
  aliases: [],
  category: 'fun',
  description: 'Get a random truth question',
  async execute({ sock, remoteJid, msg }) {
    const t = truths[Math.floor(Math.random() * truths.length)];
    await reply(sock, remoteJid, `Truth: ${t}`, msg);
  }
};

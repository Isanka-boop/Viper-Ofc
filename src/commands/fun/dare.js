const dares = [
  'Send a voice note singing your favorite song',
  'Text your crush right now',
  'Do 10 push ups',
  'Post an embarrassing photo as your status for 5 minutes'
];
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'dare',
  aliases: [],
  category: 'fun',
  description: 'Get a random dare',
  async execute({ sock, remoteJid, msg }) {
    const d = dares[Math.floor(Math.random() * dares.length)];
    await reply(sock, remoteJid, `Dare: ${d}`, msg);
  }
};

const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'time',
  aliases: ['date'],
  category: 'utility',
  description: 'Show the current server date and time',
  async execute({ sock, remoteJid, msg }) {
    const now = new Date();
    await reply(sock, remoteJid, `Current time: ${now.toUTCString()}`, msg);
  }
};

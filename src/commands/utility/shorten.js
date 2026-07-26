const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'shorten',
  aliases: ['shorturl'],
  category: 'utility',
  description: 'Shorten a long URL',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args[0]) return reply(sock, remoteJid, 'Provide a URL to shorten.', msg);
    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(args[0])}`);
      await reply(sock, remoteJid, `Shortened URL: ${res.data}`, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Failed to shorten the URL right now.', msg);
    }
  }
};

const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'wiki',
  aliases: ['wikipedia'],
  category: 'search',
  description: 'Search Wikipedia for a topic',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: wiki <topic>', msg);
    try {
      const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(args.join(' '))}`);
      await reply(sock, remoteJid, `${res.data.title}\n\n${res.data.extract}`, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'No Wikipedia article found for that topic.', msg);
    }
  }
};

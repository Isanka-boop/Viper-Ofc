const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'weather',
  aliases: [],
  category: 'utility',
  description: 'Get current weather for a city',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: weather <city name>', msg);
    try {
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(args.join(' '))}?format=%l:+%c+%t+%h+%w`);
      await reply(sock, remoteJid, res.data, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Could not fetch weather right now.', msg);
    }
  }
};

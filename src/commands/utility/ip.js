const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'ip',
  aliases: ['iplookup'],
  category: 'utility',
  description: 'Look up information about an IP address',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args[0]) return reply(sock, remoteJid, 'Usage: ip <address>', msg);
    try {
      const res = await axios.get(`https://ipapi.co/${args[0]}/json/`);
      const d = res.data;
      const text = [
        `IP: ${d.ip}`,
        `City: ${d.city}`,
        `Region: ${d.region}`,
        `Country: ${d.country_name}`,
        `ISP: ${d.org}`
      ].join('\n');
      await reply(sock, remoteJid, text, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'IP lookup failed.', msg);
    }
  }
};

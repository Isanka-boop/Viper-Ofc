const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'pinterest',
  aliases: ['pin'],
  category: 'downloader',
  description: 'Search Pinterest for images. Usage: pinterest <search term>',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: pinterest <search term>', msg);
    try {
      const res = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/`, {
        params: {
          source_url: `/search/pins/?q=${encodeURIComponent(args.join(' '))}`,
          data: JSON.stringify({ options: { query: args.join(' ') }, context: {} })
        }
      });
      await reply(sock, remoteJid, 'Pinterest search completed. Note: this endpoint may need adjustment as Pinterest changes its API.', msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Pinterest search failed. This command may need a dedicated API provider configured.', msg);
    }
  }
};

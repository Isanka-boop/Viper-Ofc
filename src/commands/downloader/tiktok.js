const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'tiktok',
  aliases: ['tt'],
  category: 'downloader',
  description: 'Download a TikTok video without watermark. Usage: tiktok <url>',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args[0]) return reply(sock, remoteJid, 'Usage: tiktok <tiktok url>', msg);
    try {
      const res = await axios.get('https://www.tikwm.com/api/', { params: { url: args[0] } });
      const videoUrl = res.data?.data?.play;
      if (!videoUrl) throw new Error('no url');
      await sock.sendMessage(remoteJid, { video: { url: videoUrl }, caption: 'Downloaded via V!PER MD OFC' }, { quoted: msg });
    } catch (err) {
      await reply(sock, remoteJid, 'Could not download that TikTok video. Check the link and try again.', msg);
    }
  }
};

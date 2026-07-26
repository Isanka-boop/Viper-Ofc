const config = require('../../config/config');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'ytmp3',
  aliases: ['song'],
  category: 'downloader',
  description: 'Download audio from a YouTube link. Usage: ytmp3 <url>',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args[0]) return reply(sock, remoteJid, 'Usage: ytmp3 <youtube url>', msg);
    await reply(
      sock,
      remoteJid,
      'YouTube downloading requires a configured extraction backend (e.g. yt-dlp) on the server. Add your preferred provider in src/commands/downloader/ytmp3.js to enable this command.',
      msg
    );
  }
};

const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'ytmp4',
  aliases: ['video'],
  category: 'downloader',
  description: 'Download video from a YouTube link. Usage: ytmp4 <url>',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args[0]) return reply(sock, remoteJid, 'Usage: ytmp4 <youtube url>', msg);
    await reply(
      sock,
      remoteJid,
      'YouTube video downloading requires a configured extraction backend (e.g. yt-dlp) on the server. Add your preferred provider in src/commands/downloader/ytmp4.js to enable this command.',
      msg
    );
  }
};

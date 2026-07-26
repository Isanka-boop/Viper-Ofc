const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'apk',
  aliases: [],
  category: 'downloader',
  description: 'Search and download an Android APK by name. Usage: apk <app name>',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: apk <app name>', msg);
    await reply(
      sock,
      remoteJid,
      'APK downloading requires a configured provider API. Add your preferred provider in src/commands/downloader/apk.js to enable this command.',
      msg
    );
  }
};


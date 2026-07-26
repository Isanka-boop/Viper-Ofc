const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'stickerlist',
  aliases: [],
  category: 'utility',
  description: 'List available sticker related commands',
  async execute({ sock, remoteJid, config, msg }) {
    const text = [
      'Sticker commands:',
      `${config.bot.prefix}sticker - Convert image or video to sticker`,
      `${config.bot.prefix}toimg - Convert sticker back to image`
    ].join('\n');
    await reply(sock, remoteJid, text, msg);
  }
};

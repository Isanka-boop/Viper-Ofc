const config = require('../../config/config');
const { getAllCategories } = require('../../handlers/commandLoader');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Show the full command menu organized by category',
  async execute({ sock, remoteJid, msg }) {
    const categories = getAllCategories();
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    let text = `${config.bot.name}\n`;
    text += `Owner: ${config.bot.ownerName}\n`;
    text += `Prefix: ${config.bot.prefix}\n`;
    text += `Uptime: ${h}h ${m}m\n\n`;

    let totalCommands = 0;
    for (const [category, commands] of categories.entries()) {
      const unique = [...new Set(commands)];
      totalCommands += unique.length;
      text += `${category.toUpperCase()} (${unique.length})\n`;
      text += unique.map((c) => `  ${config.bot.prefix}${c}`).join('\n');
      text += '\n\n';
    }

    text += `Total commands: ${totalCommands}\n\n`;
    text += `Support channel: ${config.branding.supportChannel}\n\n`;
    text += config.branding.footer;

    await sock.sendMessage(remoteJid, { text }, { quoted: msg });
  }
};

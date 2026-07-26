const { reply, isGroupAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'poll',
  aliases: ['vote'],
  category: 'utility',
  description: 'Create a poll. Usage: poll <question> | <option1> | <option2> ...',
  async execute({ sock, remoteJid, text, config, msg }) {
    const raw = text.slice(config.bot.prefix.length + 'poll'.length).trim();
    const parts = raw.split('|').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) return reply(sock, remoteJid, 'Usage: poll <question> | <option1> | <option2> ...', msg);

    const [question, ...options] = parts;
    await sock.sendMessage(remoteJid, {
      poll: { name: question, values: options.slice(0, 12), selectableCount: 1 }
    }, { quoted: msg });
  }
};

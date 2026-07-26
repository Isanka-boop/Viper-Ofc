const { reply, isOwner } = require('../../lib/commandHelpers');

module.exports = {
  name: 'eval',
  aliases: ['>'],
  category: 'owner',
  description: 'Execute raw JavaScript for debugging (owner only)',
  async execute({ sock, remoteJid, sender, args, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    if (!args.length) return reply(sock, remoteJid, 'Provide code to evaluate.', msg);
    try {
      let result = eval(args.join(' '));
      if (typeof result !== 'string') result = require('util').inspect(result);
      await reply(sock, remoteJid, result.slice(0, 2000), msg);
    } catch (err) {
      await reply(sock, remoteJid, `Error: ${err.message}`, msg);
    }
  }
};

const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'calculate',
  aliases: ['calc'],
  category: 'utility',
  description: 'Evaluate a basic math expression',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Provide a math expression, e.g. calc 12*4+2', msg);
    const expr = args.join(' ');
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) return reply(sock, remoteJid, 'Only numbers and + - * / ( ) are allowed.', msg);

    try {
      const result = Function(`"use strict"; return (${expr})`)();
      await reply(sock, remoteJid, `${expr} = ${result}`, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Invalid expression.', msg);
    }
  }
};

const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'currency',
  aliases: ['exchange'],
  category: 'utility',
  description: 'Convert currency. Usage: currency <amount> <from> <to>',
  async execute({ sock, remoteJid, args, msg }) {
    if (args.length < 3) return reply(sock, remoteJid, 'Usage: currency <amount> <from> <to>  e.g. currency 100 USD LKR', msg);
    const [amount, from, to] = args;
    try {
      const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`);
      const rate = res.data.rates[to.toUpperCase()];
      if (!rate) throw new Error('no rate');
      const converted = (parseFloat(amount) * rate).toFixed(2);
      await reply(sock, remoteJid, `${amount} ${from.toUpperCase()} = ${converted} ${to.toUpperCase()}`, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Currency conversion failed. Check the currency codes and try again.', msg);
    }
  }
};

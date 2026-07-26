const axios = require('axios');
const config = require('../../config/config');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'ai',
  aliases: ['gpt', 'ask'],
  category: 'ai',
  description: 'Ask an AI assistant a question (requires OPENAI_API_KEY to be configured)',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: ai <your question>', msg);
    if (!config.apiKeys.openai) {
      return reply(sock, remoteJid, 'AI command is not configured. Set OPENAI_API_KEY in the environment to enable this feature.', msg);
    }

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: args.join(' ') }]
        },
        { headers: { Authorization: `Bearer ${config.apiKeys.openai}` } }
      );
      const answer = res.data.choices[0].message.content;
      await reply(sock, remoteJid, answer, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'The AI service could not be reached right now.', msg);
    }
  }
};


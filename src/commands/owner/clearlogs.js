const { reply, isOwner } = require('../../lib/commandHelpers');
const Log = require('../../database/models/Log');

module.exports = {
  name: 'clearlogs',
  aliases: [],
  category: 'owner',
  description: 'Clear all stored logs from the database (owner only)',
  async execute({ sock, remoteJid, sender, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    await Log.deleteMany({});
    await reply(sock, remoteJid, 'All logs cleared.', msg);
  }
};

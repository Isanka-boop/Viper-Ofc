/**
 * This file is a normal command AND demonstrates how to register additional
 * commands dynamically at runtime using commandLoader.registerCustomCommand.
 * You can call registerCustomCommand(...) from anywhere (a plugin file, an
 * admin panel action, etc.) to add commands without restarting the bot.
 */
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'echo',
  aliases: [],
  category: 'general',
  description: 'Repeat back the text you send. Example of a simple custom command.',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: echo <text>', msg);
    await reply(sock, remoteJid, args.join(' '), msg);
  }
};

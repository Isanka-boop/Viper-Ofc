const config = require('../config/config');

async function sendWelcomeMessage(sock) {
  const ownerJid = sock.user?.id;
  if (!ownerJid) return;

  const text = [
    `${config.bot.name} is now connected and online.`,
    '',
    `Owner: ${config.bot.ownerName}`,
    `Prefix: ${config.bot.prefix}`,
    `Send ${config.bot.prefix}menu to see all available commands.`,
    '',
    'Join the official support channel for updates and help:',
    config.branding.supportChannel,
    '',
    config.branding.footer
  ].join('\n');

  await sock.sendMessage(ownerJid, { text }).catch(() => {});
}

async function sendSupportReminder(sock, targetJid) {
  const text = [
    `${config.bot.name} paired successfully.`,
    '',
    'Please join the official support channel for updates, announcements and help:',
    config.branding.supportChannel,
    '',
    config.branding.footer
  ].join('\n');

  await sock.sendMessage(targetJid, { text }).catch(() => {});
}

module.exports = { sendWelcomeMessage, sendSupportReminder };

const Settings = require('../database/models/Settings');
const config = require('../config/config');

async function groupHandler(sock, event) {
  const { id: groupJid, participants, action } = event;

  let settings = await Settings.findOne({ scope: groupJid }).lean();
  if (!settings) {
    settings = await Settings.create({ scope: groupJid });
    settings = settings.toObject();
  }

  let groupName = groupJid;
  try {
    const meta = await sock.groupMetadata(groupJid);
    groupName = meta.subject;
  } catch (_) {
    // ignore
  }

  for (const participant of participants) {
    const userTag = `@${participant.split('@')[0]}`;

    if (action === 'add' && settings.welcome) {
      const text = (settings.welcomeMessage || 'Welcome {user} to {group}')
        .replace('{user}', userTag)
        .replace('{group}', groupName);

      await sock
        .sendMessage(groupJid, {
          text: `${text}\n\n${config.branding.footer}`,
          mentions: [participant]
        })
        .catch(() => {});
    }

    if (action === 'remove' && settings.goodbye) {
      const text = (settings.goodbyeMessage || 'Goodbye {user}, we will miss you')
        .replace('{user}', userTag)
        .replace('{group}', groupName);

      await sock
        .sendMessage(groupJid, {
          text: `${text}\n\n${config.branding.footer}`,
          mentions: [participant]
        })
        .catch(() => {});
    }
  }
}

module.exports = groupHandler;

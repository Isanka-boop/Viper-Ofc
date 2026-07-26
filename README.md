# V!PER MD OFC

Ultra fast, modern, production ready WhatsApp Multi-Device bot built on [Baileys](https://github.com/WhiskeySockets/Baileys).

Owner: **Sasa Dev**
Website: https://vipermd.sasatech.online
Support Channel: https://whatsapp.com/channel/0029Vb86hKVJUM2SYD2qNw3K

---

## What's included

- Baileys multi-device WhatsApp connection with auto-reconnect and anti-crash handling
- MongoDB-backed session storage (no reliance on local filesystem for auth state)
- MongoDB storage for users, group/global settings, activity logs, and pairing history
- A single-page glassmorphism website for pairing (QR code + pair code, both with a 30 second countdown and auto-refresh)
- Live dashboard (connection status, uptime, user count, commands run)
- 100+ real, working commands across 10 categories (general, owner, group, utility, fun, search, sticker, converter, ai, downloader)
- Group moderation: anti-link, anti-delete toggle, warnings, welcome/goodbye messages, tagging tools, full admin controls
- Rate limiting, request throttling, and Express security middleware (helmet, cors, compression)
- Plugin-style command loader — drop a file into `src/commands/<category>/` or register one at runtime
- Terms, Privacy, and FAQ pages built into the same single-page site
- SEO meta tags, right-click disabled, mobile responsive

---

## Requirements

- Node.js 18 or newer
- A MongoDB database (local, Atlas, or any MongoDB-compatible provider)
- npm

---

## 1. Install dependencies

```bash
npm install
```

If you're on a system without a global `ffmpeg` binary, some converter commands (`tomp3`) depend on `fluent-ffmpeg` finding one on your system. Install `ffmpeg` via your OS package manager if you plan to use those commands.

## 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Key variables to set:

| Variable | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `OWNER_NUMBER` | Your WhatsApp number (digits only, with country code, no `+`) |
| `PORT` | Port the web server runs on (default `3000`) |
| `BASE_URL` / `SITE_URL` | Public URL of your deployment, used in bot messages |
| `SESSION_SECRET`, `ADMIN_PASSWORD`, `JWT_SECRET` | Change these to random strings before going to production |
| `OPENAI_API_KEY`, `REMOVE_BG_API_KEY` | Optional, enable the `ai` and `removebg` commands |

## 3. Run the project

```bash
npm start
```

This starts the Express web server (pairing website + dashboard API) on `PORT`. The WhatsApp socket itself is started on demand: visit the website, choose QR code or pair code, and the bot will connect once you scan/enter it. Once paired, the session is written to MongoDB and the bot will reconnect automatically on future restarts without needing to re-pair.

For development with auto-restart on file changes:

```bash
npm run dev
```

## 4. Pairing

Open `http://localhost:3000` (or your deployed URL) in a browser:

- **QR Code tab** — generates a QR code, scan it from WhatsApp → Linked Devices → Link a Device.
- **Pair Code tab** — enter your WhatsApp number (with country code, digits only) and get a short pairing code to enter in WhatsApp → Linked Devices → Link with phone number instead.

Both methods expire after 30 seconds and can be regenerated instantly. On successful pairing, the bot sends a welcome message to the owner's own chat and a support-channel reminder to the number that just paired.

---

## Project structure

```
viper-md-ofc/
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── session/                  # legacy/local session scratch space (MongoDB is source of truth)
├── logs/                     # rotated app/error logs (pino)
└── src/
    ├── index.js              # entrypoint — boots DB, commands, web server
    ├── config/
    │   └── config.js         # central env-driven config, including branding/footer
    ├── lib/
    │   ├── whatsapp.js        # Baileys socket manager, pairing, reconnect logic
    │   ├── logger.js          # pino logger (console + file)
    │   ├── antiCrash.js       # global uncaughtException/unhandledRejection handlers
    │   ├── rateLimiter.js     # per-user command rate limiting
    │   ├── messageUtils.js    # message parsing helpers
    │   └── commandHelpers.js  # reply/footer/permission helpers shared by commands
    ├── database/
    │   ├── connection.js      # MongoDB connect with retry/backoff
    │   ├── mongoAuthState.js  # Baileys multi-file auth state adapter backed by MongoDB
    │   └── models/            # Session, User, Settings, Log, PairSession (Mongoose)
    ├── handlers/
    │   ├── commandLoader.js   # scans src/commands, builds registry, supports runtime registration
    │   ├── messageHandler.js  # routes incoming messages to commands, autoread/react, antilink
    │   ├── groupHandler.js    # welcome/goodbye messages on participant join/leave
    │   └── welcomeHandler.js  # first-connect owner message + post-pair support reminder
    ├── commands/
    │   ├── general/    (menu, ping, alive, owner, support, about, runtime, prefix, report, donate, echo)
    │   ├── owner/      (broadcast, ban, unban, setprofile, setbio, restart, eval, setwelcome, setgoodbye, stats, listbanned, setpremium, clearlogs)
    │   ├── group/      (kick, add, promote, demote, groupinfo, groupname, groupdesc, lock, unlock, invitelink, revokelink, antilink, antidelete, tagall, hidetag, welcome, goodbye, listadmins, leave, mute, unmute, setppgroup, listmembers, warn, resetwarn, onlyadmins)
    │   ├── utility/    (userinfo, time, calculate, shorten, weather, translate, qrcode, pairhistory, currency, ip, base64encode, base64decode, reminder, poll, stickerlist, language)
    │   ├── fun/        (joke, quote, flip, dice, 8ball, truth, dare, trivia, meme, fact, ship, rate, reverse, quiz)
    │   ├── search/     (wiki, define, github, npm)
    │   ├── sticker/    (sticker, toimg)
    │   ├── converter/  (tourl, tomp3, grayscale, blur, resize, sepia, rotate, flipimg)
    │   ├── ai/         (ai, removebg — require API keys, see below)
    │   └── downloader/ (ytmp3, ytmp4, tiktok, apk, pinterest)
    └── web/
        ├── server.js          # Express + Socket.IO — pairing API, dashboard API
        └── public/
            ├── index.html      # single-page site: hero, pairing, features, dashboard, commands, terms/privacy/faq
            └── app.js          # pairing flow, countdowns, live dashboard polling, command search
```

---

## Adding a new command

Create a file in the matching category folder under `src/commands/`:

```js
// src/commands/general/hello.js
module.exports = {
  name: 'hello',
  aliases: ['hi'],
  category: 'general',
  description: 'Say hello',
  async execute({ sock, remoteJid, msg }) {
    const { reply } = require('../../lib/commandHelpers');
    await reply(sock, remoteJid, 'Hello there!', msg);
  }
};
```

Restart the bot (or call `commandLoader.loadCommands()` again) and it's live. Commands can also be registered at runtime without a restart via `commandLoader.registerCustomCommand(cmd)`.

---

## Notes on optional commands

A few commands are honest placeholders that need a provider configured before they do real work, rather than being faked:

- `ytmp3` / `ytmp4` — YouTube extraction changes often and typically needs a dedicated backend (e.g. `yt-dlp` running server-side). Wire your preferred extractor into these files.
- `apk` — needs an APK search/download provider API.
- `pinterest` — Pinterest's internal API is not officially public and may need adjustment over time.
- `ai` / `removebg` — work out of the box once you set `OPENAI_API_KEY` / `REMOVE_BG_API_KEY` in `.env`.

Every other command (100 total across the categories above) is fully implemented and functional.

---

## Deployment

Works on any Node.js host: VPS, Render, Railway, Heroku-style platforms.

- Set all `.env` variables in your host's environment variable panel.
- Make sure outbound network access is allowed (for MongoDB and the third-party APIs used by search/fun/converter commands).
- Use a process manager (`pm2`, systemd, or your platform's built-in restart policy) so the bot restarts automatically if the process exits.
- MongoDB Atlas (free tier is enough to start) is the easiest way to get a `MONGODB_URI` without self-hosting a database.

---

## License

MIT — free to use and modify. Please keep the footer branding intact in command outputs as a courtesy to the original author.

© POWERD BY SASA DEV
CONNECT V!PER MD :- https://vipermd.sasatech.online

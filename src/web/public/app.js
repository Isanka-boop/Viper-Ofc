(function () {
  'use strict';

  const socket = io();
  let qrTimer = null;
  let codeTimer = null;
  const EXPIRY_SECONDS = 30;

  // ---------- Tabs ----------
  window.switchTab = function (tab) {
    document.querySelectorAll('.pair-tab').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.pair-body').forEach((el) => el.classList.remove('active'));
    document.querySelector(`.pair-tab:nth-child(${tab === 'qr' ? 1 : 2})`).classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
  };

  // ---------- Legal page routing ----------
  window.showLegal = function (page) {
    document.getElementById('main-view').style.display = 'none';
    document.querySelectorAll('.legal-page').forEach((el) => el.classList.remove('active'));
    document.getElementById(`view-${page}`).classList.add('active');
    window.scrollTo(0, 0);
  };

  window.showMain = function () {
    document.querySelectorAll('.legal-page').forEach((el) => el.classList.remove('active'));
    document.getElementById('main-view').style.display = 'block';
    window.scrollTo(0, 0);
  };

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ---------- Countdown ring helper ----------
  function startCountdown(seconds, onTick, onExpire) {
    let remaining = seconds;
    onTick(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      onTick(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);
    return timer;
  }

  function updateRing(circleEl, textEl, remaining, total) {
    const circumference = 169.6;
    const offset = circumference * (1 - remaining / total);
    circleEl.style.strokeDashoffset = offset;
    textEl.textContent = remaining > 0 ? remaining : '0';
    if (remaining <= 10) {
      circleEl.style.stroke = 'var(--danger)';
    } else {
      circleEl.style.stroke = 'var(--viper-green)';
    }
  }

  // ---------- QR Pairing ----------
  window.generateQR = async function () {
    if (qrTimer) clearInterval(qrTimer);

    const btn = document.getElementById('qr-generate-btn');
    const badge = document.getElementById('qr-status-badge');
    const placeholder = document.getElementById('qr-placeholder');
    const box = document.getElementById('qr-box');
    const ring = document.getElementById('qr-ring');

    btn.disabled = true;
    btn.textContent = 'Generating...';
    badge.className = 'status-badge badge-waiting';
    badge.textContent = 'Connecting';
    placeholder.style.display = 'block';
    placeholder.textContent = 'Requesting a fresh QR code...';
    box.classList.remove('scanning');

    try {
      const res = await fetch('/api/pair/qr', { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      socket.emit('subscribe', data.requestId);

      socket.once('qr', (payload) => {
        placeholder.style.display = 'none';
        box.classList.add('scanning');
        const existing = box.querySelector('img');
        if (existing) existing.remove();
        const img = document.createElement('img');
        img.src = payload.qr;
        box.appendChild(img);

        badge.className = 'status-badge badge-waiting';
        badge.textContent = 'Waiting for scan';
        ring.style.display = 'block';

        const ringFg = document.getElementById('qr-ring-fg');
        const ringText = document.getElementById('qr-countdown-text');
        qrTimer = startCountdown(
          payload.expiresIn || EXPIRY_SECONDS,
          (remaining) => updateRing(ringFg, ringText, remaining, payload.expiresIn || EXPIRY_SECONDS),
          () => {
            badge.className = 'status-badge badge-expired';
            badge.textContent = 'Expired';
            box.classList.remove('scanning');
            const img2 = box.querySelector('img');
            if (img2) img2.remove();
            placeholder.style.display = 'block';
            placeholder.textContent = 'Code expired. Generate a new one.';
          }
        );
      });

      socket.once('connected', () => {
        if (qrTimer) clearInterval(qrTimer);
        showQrConnected();
      });

      socket.once('expired', () => {
        badge.className = 'status-badge badge-expired';
        badge.textContent = 'Expired';
      });

      btn.disabled = false;
      btn.textContent = 'Generate New Code';
    } catch (err) {
      placeholder.textContent = 'Failed to generate QR code. Try again.';
      btn.disabled = false;
      btn.textContent = 'Generate QR Code';
    }
  };

  function showQrConnected() {
    document.getElementById('qr-box').style.display = 'none';
    document.querySelector('#tab-qr .qr-info').style.display = 'none';
    const panel = document.getElementById('qr-connected');
    panel.style.display = 'block';
    panel.innerHTML = renderConnectedHTML();
  }

  // ---------- Pair Code ----------
  window.generateCode = async function () {
    const input = document.getElementById('phone-input');
    const btn = document.getElementById('code-generate-btn');
    const resultArea = document.getElementById('code-result-area');
    const phoneNumber = input.value.trim();

    if (!phoneNumber) {
      resultArea.innerHTML = '<p style="color:var(--danger);font-size:13px;">Please enter a valid phone number with country code.</p>';
      return;
    }

    if (codeTimer) clearInterval(codeTimer);
    btn.disabled = true;
    btn.textContent = 'Generating...';
    resultArea.innerHTML = '<p style="font-size:13px;color:var(--text-dim);">Requesting pair code...</p>';

    try {
      const res = await fetch('/api/pair/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (!data.success) {
        resultArea.innerHTML = `<p style="color:var(--danger);font-size:13px;">${data.message}</p>`;
        btn.disabled = false;
        btn.textContent = 'Generate Pair Code';
        return;
      }

      socket.emit('subscribe', data.requestId);

      socket.once('code', (payload) => {
        resultArea.innerHTML = `
          <div class="pair-code-display">${payload.code}</div>
          <div class="countdown-ring" id="code-ring">
            <svg width="64" height="64">
              <circle class="ring-bg" cx="32" cy="32" r="27"></circle>
              <circle class="ring-fg" id="code-ring-fg" cx="32" cy="32" r="27" stroke-dasharray="169.6" stroke-dashoffset="0"></circle>
            </svg>
            <div class="countdown-text" id="code-countdown-text">30</div>
          </div>
          <p style="font-size:13px;color:var(--text-dim);margin-top:12px;">Enter this code in WhatsApp under Linked Devices before it expires.</p>
        `;

        const ringFg = document.getElementById('code-ring-fg');
        const ringText = document.getElementById('code-countdown-text');
        codeTimer = startCountdown(
          payload.expiresIn || EXPIRY_SECONDS,
          (remaining) => updateRing(ringFg, ringText, remaining, payload.expiresIn || EXPIRY_SECONDS),
          () => {
            resultArea.innerHTML = '<p style="color:var(--danger);font-size:13px;">Pair code expired. Generate a new one.</p>';
          }
        );
      });

      socket.once('connected', () => {
        if (codeTimer) clearInterval(codeTimer);
        showCodeConnected();
      });

      socket.once('expired', () => {
        resultArea.innerHTML = '<p style="color:var(--danger);font-size:13px;">Pair code expired. Generate a new one.</p>';
      });

      btn.disabled = false;
      btn.textContent = 'Generate New Code';
    } catch (err) {
      resultArea.innerHTML = '<p style="color:var(--danger);font-size:13px;">Failed to generate pair code. Try again.</p>';
      btn.disabled = false;
      btn.textContent = 'Generate Pair Code';
    }
  };

  function showCodeConnected() {
    document.getElementById('code-result-area').style.display = 'none';
    document.querySelector('#tab-code .code-input-row').style.display = 'none';
    const panel = document.getElementById('code-connected');
    panel.style.display = 'block';
    panel.innerHTML = renderConnectedHTML();
  }

  function renderConnectedHTML() {
    return `
      <div class="check-circle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7ee7b2" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <h3 style="font-family:var(--font-display);font-size:20px;">Successfully paired</h3>
      <p style="color:var(--text-dim);font-size:14px;margin-top:8px;">V!PER MD OFC is now linked to your WhatsApp account.</p>
      <div class="support-box">
        <div style="text-align:left;">
          <div style="font-weight:700;font-size:14px;">Join the official support channel</div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:2px;">Get updates, help, and announcements</div>
        </div>
        <a href="https://whatsapp.com/channel/0029Vb86hKVJUM2SYD2qNw3K" target="_blank" class="btn-primary" style="padding:10px 20px;font-size:13px;">Join Channel</a>
      </div>
    `;
  }

  // ---------- Dashboard polling ----------
  async function refreshDashboard() {
    try {
      const [statusRes, statsRes] = await Promise.all([
        fetch('/api/status').then((r) => r.json()),
        fetch('/api/stats').then((r) => r.json())
      ]);

      if (statusRes.success) {
        document.getElementById('d-status').textContent = capitalize(statusRes.status || 'unknown');
        const uptimeSec = Math.floor((statusRes.uptimeMs || 0) / 1000);
        const h = Math.floor(uptimeSec / 3600);
        const m = Math.floor((uptimeSec % 3600) / 60);
        document.getElementById('d-uptime').textContent = uptimeSec > 0 ? `${h}h ${m}m` : '--';
        document.getElementById('stat-uptime').textContent = capitalize(statusRes.status || 'offline');
      }

      if (statsRes.success) {
        document.getElementById('d-users').textContent = statsRes.totalUsers ?? '--';
        document.getElementById('d-commands').textContent = statsRes.totalCommandsRun ?? '--';
        if (statsRes.totalCommands) {
          document.getElementById('stat-commands').textContent = `${statsRes.totalCommands}+`;
        }
      }
    } catch (err) {
      // Silent fail, dashboard is non critical for first paint
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }

  refreshDashboard();
  setInterval(refreshDashboard, 15000);

  // ---------- Command list (static reference rendered client side) ----------
  const COMMAND_DATA = {
    general: ['menu', 'ping', 'alive', 'owner', 'support', 'about', 'runtime', 'prefix', 'report', 'donate', 'echo'],
    owner: ['broadcast', 'ban', 'unban', 'setprofile', 'setbio', 'restart', 'eval', 'setwelcome', 'setgoodbye', 'stats', 'listbanned', 'setpremium', 'clearlogs'],
    group: ['kick', 'add', 'promote', 'demote', 'groupinfo', 'groupname', 'groupdesc', 'lock', 'unlock', 'invitelink', 'revokelink', 'antilink', 'antidelete', 'tagall', 'hidetag', 'welcome', 'goodbye', 'listadmins', 'leave', 'mute', 'unmute', 'setppgroup', 'listmembers', 'warn', 'resetwarn', 'onlyadmins'],
    utility: ['userinfo', 'time', 'calculate', 'shorten', 'weather', 'translate', 'qrcode', 'pairhistory', 'currency', 'ip', 'base64encode', 'base64decode', 'reminder', 'poll', 'stickerlist', 'language'],
    fun: ['joke', 'quote', 'flip', 'dice', '8ball', 'truth', 'dare', 'trivia', 'meme', 'fact', 'ship', 'rate', 'reverse', 'quiz'],
    search: ['wiki', 'define', 'github', 'npm'],
    sticker: ['sticker', 'toimg'],
    converter: ['tourl', 'tomp3', 'grayscale', 'blur', 'resize', 'sepia', 'rotate', 'flipimg'],
    ai: ['ai', 'removebg'],
    downloader: ['ytmp3', 'ytmp4', 'tiktok', 'apk', 'pinterest']
  };

  const cmdCategoriesEl = document.getElementById('cmd-categories');
  const cmdGridEl = document.getElementById('cmd-grid');
  let activeCategory = 'all';

  function renderCategoryPills() {
    const cats = ['all', ...Object.keys(COMMAND_DATA)];
    cmdCategoriesEl.innerHTML = cats
      .map((c) => `<button class="cmd-cat-pill${c === activeCategory ? ' active' : ''}" data-cat="${c}">${c === 'all' ? 'All' : capitalize(c)}</button>`)
      .join('');

    cmdCategoriesEl.querySelectorAll('.cmd-cat-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        activeCategory = pill.dataset.cat;
        renderCategoryPills();
        renderCommandGrid();
      });
    });
  }

  function renderCommandGrid(filter) {
    let entries = [];
    for (const [cat, cmds] of Object.entries(COMMAND_DATA)) {
      if (activeCategory !== 'all' && activeCategory !== cat) continue;
      cmds.forEach((c) => entries.push({ cat, cmd: c }));
    }

    if (filter) {
      const f = filter.toLowerCase();
      entries = entries.filter((e) => e.cmd.toLowerCase().includes(f));
    }

    cmdGridEl.innerHTML = entries
      .map((e) => `<div class="glass-card cmd-chip"><b>.${e.cmd}</b><br><span style="opacity:0.6;">${e.cat}</span></div>`)
      .join('') || '<p style="color:var(--text-faint);font-size:14px;">No commands match your search.</p>';
  }

  document.getElementById('cmd-search').addEventListener('input', (e) => {
    renderCommandGrid(e.target.value);
  });

  renderCategoryPills();
  renderCommandGrid();
})();


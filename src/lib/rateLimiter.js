const NodeCache = require('node-cache');
const config = require('../config/config');

const hits = new NodeCache({ stdTTL: Math.ceil(config.rateLimit.windowMs / 1000) });

/**
 * Simple sliding-window-ish rate limiter keyed by user jid.
 * Returns true if the request is allowed, false if it should be blocked.
 */
function allow(jid) {
  const key = `rl:${jid}`;
  const count = hits.get(key) || 0;

  if (count >= config.rateLimit.max) {
    return false;
  }

  hits.set(key, count + 1);
  return true;
}

module.exports = { allow };

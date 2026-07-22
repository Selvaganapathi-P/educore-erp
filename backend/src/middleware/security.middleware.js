const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

// Per-tenant AI rate limit — SSE streaming is expensive
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 20,
  keyGenerator: (req) => `ai:${req.user?._id ?? req.ip}`,
  message: { success: false, message: 'Too many AI requests — wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for password-reset / OTP flows
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests — try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet CSP configuration
function helmetOptions() {
  if (env.isDev) {
    // Relaxed in dev so Vite HMR and devtools work
    return {};
  }
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'"],
        styleSrc:       ["'self'", "'unsafe-inline'"],   // Tailwind inline styles
        imgSrc:         ["'self'", 'data:', 'blob:'],
        connectSrc:     ["'self'"],
        fontSrc:        ["'self'", 'data:'],
        objectSrc:      ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: env.isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,   // Allow embedding school resources
    hsts: {
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true,
    },
  };
}

// Sanitise common injection patterns from request body/query/params
function sanitizeRequest(req, _res, next) {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }
      if (typeof obj[key] === 'object') clean(obj[key]);
    }
  };
  clean(req.body);
  clean(req.query);
  next();
}

module.exports = { aiLimiter, strictLimiter, helmetOptions, sanitizeRequest };

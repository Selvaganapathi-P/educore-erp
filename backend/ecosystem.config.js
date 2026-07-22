module.exports = {
  apps: [
    {
      name:         'educore-api',
      script:       'src/server.js',
      instances:    'max',          // one per CPU core
      exec_mode:    'cluster',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT:     5000,
      },
      // Graceful shutdown
      kill_timeout:      5000,
      listen_timeout:    8000,
      wait_ready:        true,
      // Logging
      log_date_format:   'YYYY-MM-DD HH:mm:ss Z',
      error_file:        'logs/pm2-error.log',
      out_file:          'logs/pm2-out.log',
      merge_logs:        true,
    },
  ],
};

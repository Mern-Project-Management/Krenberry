module.exports = {
  apps: [
    {
      name: "Krenberry",
      cwd: "/var/www/rndprojects/Krenberry/backend", // Pointing to the backend directory
      script: "index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3006,
      },
    },
  ],
};

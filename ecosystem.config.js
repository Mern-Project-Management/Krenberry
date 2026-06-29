module.exports = {
  apps: [
    {
      name: "Krenberry",
      cwd: "/var/www/rndprojects/Krenberry", // Change if your project is in a different directory
      script: "npm",
      args: "start",
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

module.exports = {
  apps: [{
    name: 'digitalnarratives',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
}

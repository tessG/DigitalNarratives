module.exports = {
  apps: [{
    name: 'narrativefingerprint',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
}

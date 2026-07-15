// Temporary in-memory nonce store (production mein Redis better hota hai)
const nonceStore = new Map();

const generateNonce = (walletAddress) => {
  const nonce = `NexusFlow verification code: ${Math.floor(
    Math.random() * 1000000
  )} - ${Date.now()}`;

  nonceStore.set(walletAddress.toLowerCase(), {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minute expiry
  });

  return nonce;
};

const getNonce = (walletAddress) => {
  const entry = nonceStore.get(walletAddress.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    nonceStore.delete(walletAddress.toLowerCase());
    return null;
  }
  return entry.nonce;
};

const clearNonce = (walletAddress) => {
  nonceStore.delete(walletAddress.toLowerCase());
};

module.exports = { generateNonce, getNonce, clearNonce };
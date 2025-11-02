let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io is not initialized yet');
  }
  return ioInstance;
}

module.exports = { setIO, getIO };

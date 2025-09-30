exports.success = (message, data = null) => {
  return {
    success: true,
    message,
    data,
  };
};

// Error response formatter
exports.error = (message, details = null) => {
  return {
    success: false,
    message,
    details,
  };
};

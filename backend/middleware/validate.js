const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      error('Validation failed', {
        errors: errors.array().map((e) => ({ field: e.param, msg: e.msg })),
      })
    );
  }
  next();
};

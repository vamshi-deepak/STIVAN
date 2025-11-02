const dns = require('dns').promises;

// List of common disposable/temporary email domains
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.com',
  'throwaway.email', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com',
  'maildrop.cc', 'getnada.com', 'yopmail.com', 'emailondeck.com',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'spam4.me',
  'mintemail.com', 'mytrashmail.com', 'mailnesia.com', 'trash-mail.com',
  'mohmal.com', 'dispostable.com', 'throwawaymail.com', 'tempinbox.com'
];

// Common typos of popular email providers
const COMMON_TYPOS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlookk.com': 'outlook.com'
};

/**
 * Validate email format using regex
 */
function isValidFormat(email) {
  if (!email || typeof email !== 'string') return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional checks
  const [localPart, domain] = email.split('@');
  
  // Local part should not be empty
  if (!localPart || localPart.length === 0) return false;
  
  // Domain should have at least one dot
  if (!domain || !domain.includes('.')) return false;
  
  // Domain should not start or end with a dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }
  
  return true;
}

/**
 * Check if email domain is disposable
 */
function isDisposableDomain(email) {
  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_DOMAINS.includes(domain);
}

/**
 * Check for common typos and suggest corrections
 */
function checkTypos(email) {
  const domain = email.toLowerCase().split('@')[1];
  if (COMMON_TYPOS[domain]) {
    return {
      hasTypo: true,
      suggestion: email.replace(domain, COMMON_TYPOS[domain])
    };
  }
  return { hasTypo: false };
}

/**
 * Verify domain has valid MX records (indicates real email server)
 */
async function hasMXRecords(email) {
  try {
    const domain = email.split('@')[1];
    const addresses = await dns.resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    // DNS lookup failed - domain doesn't exist or has no MX records
    return false;
  }
}

/**
 * Comprehensive email validation
 * @param {string} email - Email to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
async function validateEmail(email, options = {}) {
  const {
      checkMX = true,           // Check MX records
      blockDisposable = true,   // Block disposable emails
      checkTypos: checkTyposOption = true         // Check for typos
  } = options;

  const result = {
    isValid: false,
    email: email,
    errors: [],
    warnings: [],
    suggestion: null
  };

  // 1. Format validation
  if (!isValidFormat(email)) {
    result.errors.push('Invalid email format');
    return result;
  }

  // 2. Check for disposable domains
  if (blockDisposable && isDisposableDomain(email)) {
    result.errors.push('Disposable email addresses are not allowed. Please use a permanent email address.');
    return result;
  }

  // 3. Check for common typos
  if (checkTyposOption) {
    const typoCheck = checkTypos(email);
    if (typoCheck.hasTypo) {
      result.warnings.push(`Did you mean ${typoCheck.suggestion}?`);
      result.suggestion = typoCheck.suggestion;
    }
  }

  // 4. MX record validation (verify domain has email server)
  if (checkMX) {
    const hasMX = await hasMXRecords(email);
    if (!hasMX) {
      result.errors.push('Email domain does not exist or cannot receive emails. Please check your email address.');
      return result;
    }
  }

  // All checks passed
  result.isValid = true;
  return result;
}

/**
 * Quick synchronous validation (format + disposable only)
 */
function validateEmailSync(email, blockDisposable = true) {
  const errors = [];

  if (!isValidFormat(email)) {
    errors.push('Invalid email format');
  }

  if (blockDisposable && isDisposableDomain(email)) {
    errors.push('Disposable email addresses are not allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Express middleware for email validation
 */
function emailValidationMiddleware(options = {}) {
  return async (req, res, next) => {
    const email = req.body.email;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    try {
      const validation = await validateEmail(email.toLowerCase().trim(), options);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.errors[0] || 'Invalid email address',
          errors: validation.errors,
          suggestion: validation.suggestion
        });
      }

      // Attach validation result to request for logging
      req.emailValidation = validation;
      
      // Normalize email
      req.body.email = email.toLowerCase().trim();
      
      next();
    } catch (error) {
      console.error('Email validation error:', error);
      // On validation error, allow but log
      next();
    }
  };
}

module.exports = {
  validateEmail,
  validateEmailSync,
  isValidFormat,
  isDisposableDomain,
  hasMXRecords,
  checkTypos,
  emailValidationMiddleware,
  DISPOSABLE_DOMAINS
};

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const AuthxUserService = require('../services/authxUserService');

const INSTAJOBS_PROJECT_ID = '06387796-e643-4f32-9bcd-c68b02cb1d60';
const baseUrl = process.env.AUTHX_BASE_URL || 'https://auth.surefy.co';

const client = jwksClient({
  jwksUri: `${baseUrl}/api/v1/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 3600000, // 1 hour
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

function getKey(header, callback) {
  const kid = header?.kid || null;
  client.getSigningKey(kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key ? (key.getPublicKey() || key.rsaPublicKey) : null;
    if (!signingKey) {
      return callback(new Error('Unable to retrieve RSA public signing key from JWKS.'));
    }
    callback(null, signingKey);
  });
}

/**
 * Express AuthX-Only Authentication Middleware
 * Verifies AuthX RS256 Bearer JWT tokens via JWKS and attaches standardized user payload
 * to req.user = { id, email, role }.
 */
const unifiedAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Expected Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication token is empty.'
      });
    }

    // Verify AuthX RS256 JWT Token
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (err, verifiedPayload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'AuthX access token has expired.'
          });
        }
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: err.message || 'Invalid AuthX access token signature or format.'
        });
      }

      if (!verifiedPayload || !verifiedPayload.sub) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'AuthX token payload is missing required sub identity claim.'
        });
      }

      if (verifiedPayload.projectId && verifiedPayload.projectId !== INSTAJOBS_PROJECT_ID) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'AuthX token project ID does not match InstaJobs application.'
        });
      }

      // Attach verified AuthX claims
      req.authxUser = verifiedPayload;

      // Resolve internal InstaJobs user (users.authx_user_id -> users.id)
      try {
        const dbUser = await AuthxUserService.findUserByAuthxId(verifiedPayload.sub);
        if (!dbUser) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'AuthX user identity is not mapped to an internal InstaJobs user.'
          });
        }

        const isEmailRegistered = dbUser.password_hash === 'AUTHX_EMAIL' || 
          (dbUser.password_hash !== 'AUTHX_PHONE' && dbUser.email && typeof dbUser.email === 'string' && dbUser.email.includes('@'));
        const authMethod = isEmailRegistered ? 'email' : 'phone';
        const actualEmail = (dbUser.email && typeof dbUser.email === 'string' && dbUser.email.includes('@')) ? dbUser.email : null;

        req.user = {
          id: dbUser.id,
          email: actualEmail,
          role: dbUser.role,
          authMethod: authMethod
        };

        return next();
      } catch (mappingErr) {
        return res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: `User mapping failure: ${mappingErr.message}`
        });
      }
    });
  } catch (err) {
    console.error('[unifiedAuthMiddleware Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to authenticate request.'
    });
  }
};

module.exports = unifiedAuthMiddleware;

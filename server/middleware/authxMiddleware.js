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
 * Express Middleware: AuthX JWT Verification & Identity Mapping
 * Verifies AuthX RS256 access token from Authorization Bearer header.
 * Attaches req.authxUser and (if mapped) req.user payload.
 */
const authxMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        statusCode: 401,
        responseStatus: 'ERROR',
        responseCode: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header. Expected Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        responseStatus: 'ERROR',
        responseCode: 'UNAUTHORIZED',
        message: 'Authentication access token is empty.'
      });
    }

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({
            statusCode: 403,
            responseStatus: 'ERROR',
            responseCode: 'TOKEN_EXPIRED',
            message: 'AuthX access token has expired.'
          });
        }
        return res.status(401).json({
          statusCode: 401,
          responseStatus: 'ERROR',
          responseCode: 'INVALID_TOKEN',
          message: err.message || 'Invalid AuthX access token signature or format.'
        });
      }

      if (!payload || !payload.sub) {
        return res.status(401).json({
          statusCode: 401,
          responseStatus: 'ERROR',
          responseCode: 'INVALID_TOKEN_CLAIMS',
          message: 'AuthX token payload is missing required sub identity claim.'
        });
      }

      // Verify Project ID if present in claims
      if (payload.projectId && payload.projectId !== INSTAJOBS_PROJECT_ID) {
        return res.status(403).json({
          statusCode: 403,
          responseStatus: 'ERROR',
          responseCode: 'INVALID_PROJECT_ID',
          message: 'AuthX token project ID does not match InstaJobs application.'
        });
      }

      // Attach verified AuthX payload
      req.authxUser = {
        sub: payload.sub,
        surefyId: payload.surefyId,
        scope: payload.scope,
        projectId: payload.projectId,
        companyId: payload.companyId,
        sessionId: payload.sessionId,
        iat: payload.iat,
        exp: payload.exp
      };

      // Resolve internal InstaJobs user (users.authx_user_id -> users.id)
      try {
        const dbUser = await AuthxUserService.findUserByAuthxId(payload.sub);
        if (dbUser) {
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
        }
      } catch (mappingErr) {
        console.warn('[authxMiddleware] User mapping warning:', mappingErr.message);
      }

      next();
    });
  } catch (error) {
    console.error('[authxMiddleware Error]', error);
    return res.status(500).json({
      statusCode: 500,
      responseStatus: 'ERROR',
      responseCode: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to authenticate AuthX request.'
    });
  }
};

module.exports = authxMiddleware;

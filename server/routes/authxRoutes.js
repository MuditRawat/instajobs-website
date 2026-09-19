const express = require('express');
const router = express.Router();
const AuthxService = require('../services/authxService');
const AuthxUserService = require('../services/authxUserService');
const authxMiddleware = require('../middleware/authxMiddleware');
const { validateAndNormalizeIdentifier } = require('../utils/identifierValidator');
const jwt = require('jsonwebtoken');

/**
 * POST /api/v1/authx/start
 */
router.post('/start', async (req, res) => {
  try {
    const { identifier } = req.body || {};
    const validation = validateAndNormalizeIdentifier(identifier);
    if (!validation.isValid) {
      return res.status(400).json({
        statusCode: 400,
        responseStatus: 'ERROR',
        responseCode: 'INVALID_IDENTIFIER',
        message: validation.error || 'Enter a valid email address or mobile number.'
      });
    }

    const result = await AuthxService.startFlow(validation.normalized);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      responseStatus: 'ERROR',
      responseCode: error.responseCode || 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/authx/send-otp
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { requestId, method } = req.body || {};
    const result = await AuthxService.sendOtp(requestId, method);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      responseStatus: 'ERROR',
      responseCode: error.responseCode || 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/authx/verify
 * Verifies AuthX OTP and maps/creates internal InstaJobs user identity
 * Accepts: flow ('login' | 'register'), role ('candidate' | 'employer'), identifier, otp, requestId, method
 */
router.post('/verify', async (req, res) => {
  try {
    const { requestId, method, otp, role, identifier, flow = 'login' } = req.body || {};

    const verifyResult = await AuthxService.verifyOtp(requestId, method, otp);

    const respData = verifyResult.responseData || verifyResult;
    const accessToken = respData.accessToken || verifyResult.accessToken;
    const refreshToken = respData.refreshToken || verifyResult.refreshToken;
    const expiresIn = respData.expiresIn || verifyResult.expiresIn;

    let authxSub = respData.user?.id || respData.user?.sub;
    if (!authxSub && accessToken) {
      const decoded = jwt.decode(accessToken);
      authxSub = decoded?.sub;
    }

    if (!authxSub) {
      throw new Error('Unable to extract AuthX user identity (sub) from verification response.');
    }

    // Normalize identifier if provided
    let normalizedIdentifier = null;
    if (identifier) {
      const val = validateAndNormalizeIdentifier(identifier);
      if (val.isValid) {
        normalizedIdentifier = val.normalized;
      }
    }

    // Lookup existing InstaJobs user by AuthX sub (with optional normalized email/phone hint)
    let dbUser = await AuthxUserService.findUserByAuthxId(authxSub, normalizedIdentifier);

    // If NO user is found by authx_user_id AND method === 'EMAIL_OTP', check for legacy email account linking
    if (!dbUser && method === 'EMAIL_OTP' && normalizedIdentifier && normalizedIdentifier.includes('@')) {
      const legacyUser = await AuthxUserService.findUserByEmail(normalizedIdentifier);
      if (legacyUser && (!legacyUser.authx_user_id || legacyUser.authx_user_id === null)) {
        // Atomically link legacy account to verified AuthX sub
        const linkedUser = await AuthxUserService.linkAuthxIdToExistingUser(legacyUser.id, authxSub);
        if (linkedUser) {
          dbUser = linkedUser;
        } else {
          // Double-check if linked concurrently
          dbUser = await AuthxUserService.findUserByAuthxId(authxSub, normalizedIdentifier);
        }
      }
    }

    if (flow === 'register') {
      // REGISTRATION FLOW: Do NOT create duplicate account if user already exists
      if (dbUser) {
        return res.status(409).json({
          statusCode: 409,
          responseStatus: 'ERROR',
          responseCode: 'USER_ALREADY_EXISTS',
          message: 'An account already exists. Please log in.'
        });
      }

      // Determine identifier type correctly
      const isEmail = (method === 'EMAIL_OTP') || (normalizedIdentifier && normalizedIdentifier.includes('@'));

      // Create brand-new InstaJobs user and candidate/employer profile
      dbUser = await AuthxUserService.createAuthxUser({
        authxSub,
        email: isEmail ? normalizedIdentifier : null,
        phone: !isEmail ? normalizedIdentifier : null,
        role: (role === 'employer') ? 'employer' : 'candidate'
      });
    } else {
      // LOGIN FLOW (default): MUST ONLY authenticate an existing InstaJobs user
      if (!dbUser) {
        return res.status(404).json({
          statusCode: 404,
          responseStatus: 'ERROR',
          responseCode: 'USER_NOT_FOUND',
          message: 'No account found. Please register first.'
        });
      }

      // Ensure verified phone number is backfilled into candidate_profiles if currently missing
      const isEmail = (method === 'EMAIL_OTP') || (normalizedIdentifier && normalizedIdentifier.includes('@'));
      if (!isEmail && normalizedIdentifier && dbUser.role === 'candidate') {
        try {
          const supabase = require('../config/supabase');
          if (supabase) {
            const { data: prof } = await supabase
              .from('candidate_profiles')
              .select('phone')
              .eq('user_id', dbUser.id)
              .maybeSingle();

            if (!prof || !prof.phone) {
              await supabase
                .from('candidate_profiles')
                .update({ phone: normalizedIdentifier })
                .eq('user_id', dbUser.id);
            }
          }
        } catch (e) {
          console.warn('[authxRoutes] Backfill phone warning:', e.message);
        }
      }
    }

    return res.status(200).json({
      statusCode: 200,
      responseStatus: 'SUCCESS',
      responseCode: 'SUCCESS',
      message: flow === 'register' ? 'Registration successful' : 'AuthX OTP verification successful',
      responseData: {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          authx_user_id: dbUser.authx_user_id
        }
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      responseStatus: 'ERROR',
      responseCode: error.responseCode || 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/authx/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    const result = await AuthxService.refreshToken(refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      responseStatus: 'ERROR',
      responseCode: error.responseCode || 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/authx/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const result = await AuthxService.logoutSession(token);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      responseStatus: 'ERROR',
      responseCode: error.responseCode || 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/authx/me (Protected via AuthX JWT Middleware)
 */
router.get('/me', authxMiddleware, async (req, res) => {
  let user = req.user;
  if (!user && req.authxUser?.sub) {
    try {
      user = await AuthxUserService.findUserByAuthxId(req.authxUser.sub);
    } catch (err) {
      user = null;
    }
  }
  return res.status(200).json({
    statusCode: 200,
    responseStatus: 'SUCCESS',
    responseCode: 'SUCCESS',
    message: 'AuthX user identity verified successfully',
    authxUser: req.authxUser,
    user: user ? { id: user.id, email: user.email, role: user.role, authx_user_id: user.authx_user_id } : null
  });
});

module.exports = router;

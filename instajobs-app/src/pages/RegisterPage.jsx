import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { validateAndNormalizeIdentifier } from '../utils/identifierValidator';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Role & Identifier, 2: OTP Entry

  // Registration Form State
  const [userType, setUserType] = useState('candidate'); // 'candidate' or 'employer'
  const [identifier, setIdentifier] = useState('');
  const [requestId, setRequestId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('EMAIL_OTP');
  const [otp, setOtp] = useState('');

  // Resend Countdown Timers (seconds)
  const [resendTimerEmail, setResendTimerEmail] = useState(0);
  const [resendTimerWhatsapp, setResendTimerWhatsapp] = useState(0);

  // Interval worker for resend countdown timers
  useEffect(() => {
    let timer;
    if (resendTimerEmail > 0 || resendTimerWhatsapp > 0) {
      timer = setInterval(() => {
        setResendTimerEmail((prev) => (prev > 0 ? prev - 1 : 0));
        setResendTimerWhatsapp((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimerEmail, resendTimerWhatsapp]);

  const triggerCooldownTimer = (method, responseOrError) => {
    const data = responseOrError?.responseData || responseOrError;
    const cooldownSecs = Number(data?.retryAfter || data?.cooldown || 30);
    if (method === 'EMAIL_OTP') {
      setResendTimerEmail(cooldownSecs);
    } else {
      setResendTimerWhatsapp(cooldownSecs);
    }
  };

  // Common UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { startAuthxFlow, sendAuthxOtp, verifyAuthxOtp, isAuthenticated, role } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'employer') {
        navigate('/employer-dashboard', { replace: true });
      } else if (role === 'candidate') {
        navigate('/candidate-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  // AuthX Registration Step 1: Start Flow
  const handleStartAuthxRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const validation = validateAndNormalizeIdentifier(identifier);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid email address or mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const startRes = await startAuthxFlow(validation.normalized);
      const data = startRes.responseData || startRes;
      const reqId = data.requestId;

      // Determine initial OTP method based on identifier type and returned methods
      const idType = validation.type; // 'mobile' or 'email'
      const returnedMethods = data.methods || (idType === 'mobile' ? ['WHATSAPP_OTP'] : ['EMAIL_OTP']);
      const defaultMethod = idType === 'mobile' ? 'WHATSAPP_OTP' : 'EMAIL_OTP';
      const chosenMethod = returnedMethods.includes(defaultMethod) ? defaultMethod : returnedMethods[0];

      setRequestId(reqId);
      setSelectedMethod(chosenMethod);

      // Trigger OTP delivery
      const sendRes = await sendAuthxOtp(reqId, chosenMethod);
      triggerCooldownTimer(chosenMethod, sendRes);
      setMessage(sendRes.message || `OTP verification code sent via ${chosenMethod === 'EMAIL_OTP' ? 'Email' : 'WhatsApp'}.`);
      setStep(2);
    } catch (err) {
      console.error('[AuthX Register Start Error]', err);
      setError(err.message || 'Failed to send OTP code. Please verify your email/phone number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // AuthX Registration Step 2: Resend Method with Expiration Recovery & Cooldown Timer
  const handleResendOtp = async (method) => {
    setError('');
    setMessage('');

    const validation = validateAndNormalizeIdentifier(identifier);
    const targetMethod = method || selectedMethod;
    const activeTimer = targetMethod === 'WHATSAPP_OTP' ? resendTimerWhatsapp : resendTimerEmail;

    // Prevent duplicate request during active countdown
    if (activeTimer > 0) {
      return;
    }

    setSelectedMethod(targetMethod);
    setIsSubmitting(true);

    try {
      const sendRes = await sendAuthxOtp(requestId, targetMethod);
      triggerCooldownTimer(targetMethod, sendRes);
      setMessage(sendRes.message || `OTP code resent via ${targetMethod === 'EMAIL_OTP' ? 'Email' : 'WhatsApp'}.`);
    } catch (err) {
      console.error('[AuthX Resend Error]', err);

      // Check if request is expired or not found — automatically recover with a fresh startFlow
      const isExpiredOrNotFound = (
        err.responseCode === 'REQUEST_EXPIRED' ||
        err.responseCode === 'REQUEST_NOT_FOUND' ||
        err.statusCode === 400 ||
        err.statusCode === 404 ||
        (err.message && (err.message.includes('expired') || err.message.includes('not found')))
      );

      if (isExpiredOrNotFound && validation.isValid) {
        try {
          console.log('[AuthX Register Resend Recovery] Request expired/invalid. Re-initiating fresh startFlow...');
          const freshStart = await startAuthxFlow(validation.normalized);
          const freshData = freshStart.responseData || freshStart;
          const freshReqId = freshData.requestId;

          if (freshReqId) {
            setRequestId(freshReqId);
            const sendRes = await sendAuthxOtp(freshReqId, targetMethod);
            triggerCooldownTimer(targetMethod, sendRes);
            setMessage(`Previous session expired. A fresh OTP code has been sent via ${targetMethod === 'EMAIL_OTP' ? 'Email' : 'WhatsApp'}.`);
            setError('');
            return;
          }
        } catch (recoveryErr) {
          console.error('[AuthX Register Recovery Error]', recoveryErr);
          setError(recoveryErr.message || 'OTP request expired. Please re-enter your details.');
          return;
        }
      }

      if (err.responseCode === 'OTP_SEND_COOLDOWN' || err.statusCode === 403) {
        triggerCooldownTimer(targetMethod, err);
        setError('Please wait before requesting another OTP.');
      } else {
        setError(err.message || 'Failed to resend OTP code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // AuthX Registration Step 3: Verify OTP & Create Account
  const handleVerifyAuthxRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter the valid OTP verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const verifyRes = await verifyAuthxOtp({
        requestId,
        method: selectedMethod,
        otp: otp.trim(),
        role: userType,
        identifier: identifier.trim(),
        flow: 'register'
      });

      const respData = verifyRes.responseData || verifyRes;
      const assignedRole = respData.user?.role || userType;

      setMessage('Account created and verified! Redirecting to dashboard...');
      setTimeout(() => {
        if (assignedRole === 'employer') {
          navigate('/employer-dashboard', { replace: true });
        } else {
          navigate('/candidate-dashboard', { replace: true });
        }
      }, 300);
    } catch (err) {
      console.error('[AuthX Register Verify Error]', err);
      if (err.responseCode === 'USER_ALREADY_EXISTS' || err.statusCode === 409) {
        setError('An account already exists. Please log in.');
      } else if (err.responseCode === 'INVALID_OTP') {
        setError('Invalid OTP code. Please check and try again.');
      } else if (err.responseCode === 'MAX_ATTEMPTS' || err.responseCode === 'REQUEST_EXPIRED') {
        setError('OTP request expired or maximum attempts exceeded. Please restart registration.');
        setStep(1);
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />

      {/* Info Section */}
      <div className="login-section">
        <div
          className="image-layer"
          style={{ backgroundImage: 'url(/images/background/12.jpg)' }}
        ></div>
        <div className="outer-box">
          {/* Login Form */}
          <div className="login-form default-form">
            <div className="form-inner">
              <h3>Create a Free Superio Account</h3>

              {message && (
                <div className="alert alert-success" style={{ marginBottom: '15px', borderRadius: '8px' }}>
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger" style={{ marginBottom: '15px', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              {/* AuthX OTP Registration Form */}
              <div>
                {/* Candidate vs Employer Role Selection Toggle (Step 1 only) */}
                {step === 1 && (
                  <div className="form-group">
                    <div className="btn-box row">
                      <div className="col-lg-6 col-md-12">
                        <a
                          href="#"
                          className={`theme-btn ${
                            userType === 'candidate' ? 'btn-style-seven' : 'btn-style-four'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setUserType('candidate');
                            setMessage('');
                            setError('');
                          }}
                        >
                          <i className="la la-user"></i> Candidate{' '}
                        </a>
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <a
                          href="#"
                          className={`theme-btn ${
                            userType === 'employer' ? 'btn-style-seven' : 'btn-style-four'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setUserType('employer');
                            setMessage('');
                            setError('');
                          }}
                        >
                          <i className="la la-briefcase"></i> Employer{' '}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <form onSubmit={handleStartAuthxRegister}>
                    <div className="form-group">
                      <label>Email Address or Phone Number</label>
                      <input
                        type="text"
                        name="identifier"
                        placeholder="Enter your email or phone"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <button
                        className="theme-btn btn-style-one"
                        type="submit"
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.7 : 1 }}
                      >
                        {isSubmitting ? 'Sending Code...' : `Register as ${userType === 'candidate' ? 'Candidate' : 'Employer'} with OTP`}
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyAuthxRegister}>
                    <div className="form-group">
                      <label>Enter Verification Code (OTP)</label>
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                        autoFocus
                      />
                      <small className="form-text text-muted" style={{ display: 'block', marginTop: '6px' }}>
                        Sent to: <strong>{identifier}</strong> ({
                          validateAndNormalizeIdentifier(identifier).type === 'mobile' ? 'WhatsApp' : 'Email'
                        })
                      </small>
                    </div>

                    <div className="form-group">
                      <button
                        className="theme-btn btn-style-one"
                        type="submit"
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.7 : 1 }}
                      >
                        {isSubmitting ? 'Verifying...' : 'Verify OTP & Complete Registration'}
                      </button>
                    </div>

                    <div className="form-group row" style={{ marginTop: '10px' }}>
                      {validateAndNormalizeIdentifier(identifier).type === 'mobile' ? (
                        <div className="col-12">
                          <button
                            type="button"
                            className="theme-btn btn-style-four"
                            style={{ width: '100%', fontSize: '13px', opacity: (isSubmitting || resendTimerWhatsapp > 0) ? 0.6 : 1 }}
                            onClick={() => handleResendOtp('WHATSAPP_OTP')}
                            disabled={isSubmitting || resendTimerWhatsapp > 0}
                          >
                            {resendTimerWhatsapp > 0
                              ? `Resend via WhatsApp in ${resendTimerWhatsapp}s`
                              : 'Resend via WhatsApp'}
                          </button>
                        </div>
                      ) : (
                        <div className="col-12">
                          <button
                            type="button"
                            className="theme-btn btn-style-four"
                            style={{ width: '100%', fontSize: '13px', opacity: (isSubmitting || resendTimerEmail > 0) ? 0.6 : 1 }}
                            onClick={() => handleResendOtp('EMAIL_OTP')}
                            disabled={isSubmitting || resendTimerEmail > 0}
                          >
                            {resendTimerEmail > 0
                              ? `Resend via Email in ${resendTimerEmail}s`
                              : 'Resend via Email'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <a
                        href="#"
                        style={{ fontSize: '13px', color: '#1967d2' }}
                        onClick={(e) => {
                          e.preventDefault();
                          setStep(1);
                          setOtp('');
                        }}
                      >
                        ← Change Email/Phone or Account Type
                      </a>
                    </div>
                  </form>
                )}
              </div>

              <div className="bottom-box">
                <div className="text">
                  Already have an account? <Link to="/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
          {/* End Login Form */}
        </div>
      </div>
      {/* End Info Section */}
    </div>
  );
};

export default RegisterPage;



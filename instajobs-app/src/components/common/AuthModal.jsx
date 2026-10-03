import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateAndNormalizeIdentifier } from '../../utils/identifierValidator';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  // Mode & Animation States
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [activeOpacity, setActiveOpacity] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userType, setUserType] = useState('candidate');

  // AuthX OTP Form States
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

  // Common UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { startAuthxFlow, sendAuthxOtp, verifyAuthxOtp } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setMode(initialMode);
      setStep(1);
      setMessage('');
      setError('');
      setIdentifier('');
      setOtp('');
      document.body.style.overflow = 'hidden';
      const timer = requestAnimationFrame(() => {
        setActiveOpacity(1);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setActiveOpacity(0);
    }
  }, [isOpen, initialMode]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setActiveOpacity(0);
    setTimeout(() => {
      document.body.style.overflow = '';
      setIsClosing(false);
      onClose();
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isClosing]);

  const switchMode = (newMode) => {
    setIsTransitioning(true);
    setMessage('');
    setError('');
    setStep(1);
    setOtp('');
    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 150);
  };

  // AuthX Step 1: Start Flow
  const handleStartAuthx = async (e) => {
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

      const idType = validation.type; // 'mobile' or 'email'
      const returnedMethods = data.methods || (idType === 'mobile' ? ['WHATSAPP_OTP'] : ['EMAIL_OTP']);
      const defaultMethod = idType === 'mobile' ? 'WHATSAPP_OTP' : 'EMAIL_OTP';
      const chosenMethod = returnedMethods.includes(defaultMethod) ? defaultMethod : returnedMethods[0];

      setRequestId(reqId);
      setSelectedMethod(chosenMethod);

      const sendRes = await sendAuthxOtp(reqId, chosenMethod);
      triggerCooldownTimer(chosenMethod, sendRes);
      setMessage(sendRes.message || `OTP sent via ${chosenMethod === 'EMAIL_OTP' ? 'Email' : 'WhatsApp'}.`);
      setStep(2);
    } catch (err) {
      console.error('[AuthModal Start Error]', err);
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // AuthX Step 2: Resend Method with Expiration Recovery & Cooldown Timer
  const handleResendAuthx = async (method) => {
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
      console.error('[AuthModal Resend Error]', err);

      const isExpiredOrNotFound = (
        err.responseCode === 'REQUEST_EXPIRED' ||
        err.responseCode === 'REQUEST_NOT_FOUND' ||
        err.statusCode === 400 ||
        err.statusCode === 404 ||
        (err.message && (err.message.includes('expired') || err.message.includes('not found')))
      );

      if (isExpiredOrNotFound && validation.isValid) {
        try {
          console.log('[AuthModal Resend Recovery] Request expired/invalid. Re-initiating fresh startFlow...');
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
          console.error('[AuthModal Recovery Error]', recoveryErr);
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

  // AuthX Step 2: Verify OTP
  const handleVerifyAuthx = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp.trim()) {
      setError('Please enter the valid OTP verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentFlow = mode === 'login' ? 'login' : 'register';
      const verifyRes = await verifyAuthxOtp({
        requestId,
        method: selectedMethod,
        otp: otp.trim(),
        role: userType,
        identifier: identifier.trim(),
        flow: currentFlow
      });

      const respData = verifyRes.responseData || verifyRes;
      const targetRole = respData.user?.role || userType;

      setMessage('Verification successful!');
      setTimeout(() => {
        handleClose();
        if (targetRole === 'admin') {
          navigate('/admin-dashboard');
        } else if (targetRole === 'employer') {
          navigate('/employer-dashboard');
        } else {
          navigate('/candidate-dashboard');
        }
      }, 300);
    } catch (err) {
      console.error('[AuthModal Verify Error]', err);
      if (err.responseCode === 'USER_NOT_FOUND' || err.statusCode === 404) {
        setError('No account found. Please register first.');
      } else if (err.responseCode === 'USER_ALREADY_EXISTS' || err.statusCode === 409) {
        setError('An account already exists. Please log in.');
      } else if (err.responseCode === 'INVALID_OTP') {
        setError('Invalid OTP code. Please check and try again.');
      } else {
        setError(err.message || 'OTP verification failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className="blocker current"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        zIndex: 99999,
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: 'rgba(32, 33, 36, 0.5)',
        textAlign: 'center',
        opacity: activeOpacity,
        transition: 'opacity 300ms linear'
      }}
      onClick={handleClose}
    >
      <div
        className="modal"
        id="login-modal"
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          position: 'relative',
          zIndex: 2,
          maxWidth: '500px',
          width: '100%',
          background: '#fff',
          padding: '30px 40px 20px',
          borderRadius: '8px',
          textAlign: 'left',
          transform: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href="#"
          className="close-modal"
          onClick={(e) => {
            e.preventDefault();
            handleClose();
          }}
        >
          Close
        </a>

        {mode === 'login' ? (
          <div
            className={`login-form default-form ${isTransitioning ? 'animated fadeOut' : ''}`}
            style={{ animationDuration: '150ms' }}
          >
            <div className="form-inner">
              <h3>Login to Superio</h3>

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

              <div>
                {step === 1 && (
                  <form onSubmit={handleStartAuthx}>
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
                        {isSubmitting ? 'Sending OTP...' : 'Continue with OTP'}
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyAuthx}>
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
                        {isSubmitting ? 'Verifying...' : 'Verify & Log In'}
                      </button>
                    </div>
                    <div className="form-group row" style={{ marginTop: '10px' }}>
                      {validateAndNormalizeIdentifier(identifier).type === 'mobile' ? (
                        <div className="col-12">
                          <button
                            type="button"
                            className="theme-btn btn-style-four"
                            style={{ width: '100%', fontSize: '13px', opacity: (isSubmitting || resendTimerWhatsapp > 0) ? 0.6 : 1 }}
                            onClick={() => handleResendAuthx('WHATSAPP_OTP')}
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
                            onClick={() => handleResendAuthx('EMAIL_OTP')}
                            disabled={isSubmitting || resendTimerEmail > 0}
                          >
                            {resendTimerEmail > 0
                              ? `Resend via Email in ${resendTimerEmail}s`
                              : 'Resend via Email'}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>

              <div className="bottom-box">
                <div className="text">
                  Don't have an account?{' '}
                  <a
                    href="#"
                    className="call-modal signup"
                    onClick={(e) => {
                      e.preventDefault();
                      switchMode('register');
                    }}
                  >
                    Signup
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`login-form default-form ${isTransitioning ? 'animated fadeOut' : ''}`}
            style={{ animationDuration: '150ms' }}
          >
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

              {/* Candidate / Employer Role Switcher (Step 1 only) */}
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
                        }}
                      >
                        <i className="la la-briefcase"></i> Employer{' '}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleStartAuthx}>
                  <div className="form-group">
                    <label>Email Address or Phone Number</label>
                    <input
                      type="text"
                      name="identifier"
                      placeholder="Enter email or phone"
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
                <form onSubmit={handleVerifyAuthx}>
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
                          onClick={() => handleResendAuthx('WHATSAPP_OTP')}
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
                          onClick={() => handleResendAuthx('EMAIL_OTP')}
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

              <div className="bottom-box">
                <div className="text">
                  Already have an account?{' '}
                  <a
                    href="#"
                    className="call-modal signup"
                    onClick={(e) => {
                      e.preventDefault();
                      switchMode('login');
                    }}
                  >
                    Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;


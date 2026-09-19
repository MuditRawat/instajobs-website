import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { validateAndNormalizeIdentifier } from '../utils/identifierValidator';

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Identifier, 3: Verify OTP

  // AuthX State
  const [identifier, setIdentifier] = useState('');
  const [requestId, setRequestId] = useState('');
  const [availableMethods, setAvailableMethods] = useState(['EMAIL_OTP', 'WHATSAPP_OTP']);
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
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

      // Determine initial OTP method based on identifier type and returned methods
      const idType = validation.type; // 'mobile' or 'email'
      const returnedMethods = data.methods || (idType === 'mobile' ? ['WHATSAPP_OTP'] : ['EMAIL_OTP']);
      const defaultMethod = idType === 'mobile' ? 'WHATSAPP_OTP' : 'EMAIL_OTP';
      const chosenMethod = returnedMethods.includes(defaultMethod) ? defaultMethod : returnedMethods[0];

      setRequestId(reqId);
      setAvailableMethods(returnedMethods);
      setSelectedMethod(chosenMethod);

      // Automatically trigger OTP send for the chosen method
      const sendRes = await sendAuthxOtp(reqId, chosenMethod);
      triggerCooldownTimer(chosenMethod, sendRes);
      setMessage(sendRes.message || `OTP sent successfully via ${chosenMethod === 'EMAIL_OTP' ? 'Email' : 'WhatsApp'}.`);
      setStep(3); // Advance directly to OTP entry
    } catch (err) {
      console.error('[AuthX Start Error]', err);
      setError(err.message || 'Failed to start OTP authentication. Please check your identifier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // AuthX Step 2: Resend Method with Expiration Recovery & Cooldown Timer
  const handleSendOtpMethod = async (method) => {
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
      setStep(3);
    } catch (err) {
      console.error('[AuthX Send OTP Error]', err);

      // Check if the request is expired or not found — automatically recover with a fresh startFlow
      const isExpiredOrNotFound = (
        err.responseCode === 'REQUEST_EXPIRED' ||
        err.responseCode === 'REQUEST_NOT_FOUND' ||
        err.statusCode === 400 ||
        err.statusCode === 404 ||
        (err.message && (err.message.includes('expired') || err.message.includes('not found')))
      );

      if (isExpiredOrNotFound && validation.isValid) {
        try {
          console.log('[AuthX Resend Recovery] Request expired/invalid. Re-initiating fresh startFlow...');
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
          console.error('[AuthX Recovery Error]', recoveryErr);
          setError(recoveryErr.message || 'OTP request expired. Please re-enter your email/phone number.');
          return;
        }
      }

      if (err.responseCode === 'OTP_SEND_COOLDOWN' || err.statusCode === 403) {
        triggerCooldownTimer(targetMethod, err);
        setError('Please wait before requesting another OTP.');
      } else {
        setError(err.message || 'Failed to send OTP code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // AuthX Step 3: Verify OTP
  const handleVerifyOtp = async (e) => {
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
        identifier: identifier.trim(),
        flow: 'login'
      });

      const respData = verifyRes.responseData || verifyRes;
      const targetRole = respData.user?.role || role;

      setMessage('Verification successful! Redirecting...');
      setTimeout(() => {
        if (targetRole === 'employer') {
          navigate('/employer-dashboard');
        } else {
          navigate('/candidate-dashboard');
        }
      }, 300);
    } catch (err) {
      console.error('[AuthX Verify Error]', err);
      if (err.responseCode === 'USER_NOT_FOUND' || err.statusCode === 404) {
        setError('No account found. Please register first.');
      } else if (err.responseCode === 'INVALID_OTP') {
        setError('Invalid OTP code. Please check and try again.');
      } else if (err.responseCode === 'MAX_ATTEMPTS' || err.responseCode === 'REQUEST_EXPIRED') {
        setError('OTP request expired or maximum attempts reached. Please request a new code.');
        setStep(1);
      } else {
        setError(err.message || 'OTP verification failed. Please try again.');
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

              {/* AuthX OTP Form */}
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

                {step === 3 && (
                  <form onSubmit={handleVerifyOtp}>
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

                    {/* Resend & Change Method Options */}
                    <div className="form-group row" style={{ marginTop: '10px' }}>
                      {validateAndNormalizeIdentifier(identifier).type === 'mobile' ? (
                        <div className="col-12">
                          <button
                            type="button"
                            className="theme-btn btn-style-four"
                            style={{ width: '100%', fontSize: '13px', opacity: (isSubmitting || resendTimerWhatsapp > 0) ? 0.6 : 1 }}
                            onClick={() => handleSendOtpMethod('WHATSAPP_OTP')}
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
                            onClick={() => handleSendOtpMethod('EMAIL_OTP')}
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
                        ← Change Email or Phone Number
                      </a>
                    </div>
                  </form>
                )}
              </div>

              <div className="bottom-box">
                <div className="text">
                  Don't have an account? <Link to="/register">Signup</Link>
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

export default LoginPage;

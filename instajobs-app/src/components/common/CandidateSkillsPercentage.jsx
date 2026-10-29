import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/candidateService';

/**
 * Calculates profile completeness score (0-100) based on actual candidate data.
 * Checks core candidate profile fields, categories, and KYC verification status.
 */
function calculateCompleteness(profile, kycStatus) {
  if (!profile) return { percentage: 0, missingFields: ['Full Name'] };

  // Weightings based on essential profile criteria
  const criteria = [
    { key: 'full_name', weight: 15, label: 'Full Name', check: (p) => !!p.full_name?.trim() },
    { key: 'job_title', weight: 15, label: 'Job Title', check: (p) => !!p.job_title?.trim() },
    { key: 'phone', weight: 10, label: 'Phone Number', check: (p) => !!p.phone?.trim() },
    { key: 'city', weight: 10, label: 'City', check: (p) => !!p.city?.trim() },
    { key: 'bio', weight: 15, label: 'About / Bio', check: (p) => !!p.bio?.trim() },
    { key: 'avatar_url', weight: 10, label: 'Profile Photo', check: (p) => !!p.avatar_url?.trim() },
    { key: 'categories', weight: 15, label: 'Job Categories', check: (p) => Array.isArray(p.categories) && p.categories.length > 0 },
    { key: 'kyc', weight: 10, label: 'Identity Verification (KYC)', check: () => kycStatus === 'verified' || kycStatus === 'approved' }
  ];

  let totalScore = 0;
  const missing = [];

  for (const item of criteria) {
    if (item.check(profile)) {
      totalScore += item.weight;
    } else {
      missing.push(item.label);
    }
  }

  return {
    percentage: Math.min(100, Math.max(0, totalScore)),
    missingFields: missing
  };
}

const CandidateSkillsPercentage = ({
  fgColor = '#7367F0',
  speed = 1500,
}) => {
  const [percentage, setPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCandidateData = async () => {
      try {
        const [profRes, kycRes] = await Promise.allSettled([
          candidateService.getCandidateProfile(),
          candidateService.getCandidateKycStatus()
        ]);

        if (!isMounted) return;

        const profile = profRes.status === 'fulfilled' ? profRes.value?.profile : null;
        const kycStatus = kycRes.status === 'fulfilled' ? kycRes.value?.status : null;

        const { percentage: calculated, missingFields: missing } = calculateCompleteness(profile, kycStatus);
        setPercentage(calculated);
        setMissingFields(missing);

        if (Array.isArray(profile?.categories)) {
          setCategories(profile.categories);
        }
      } catch (err) {
        console.warn('[CandidateSkillsPercentage] Failed to compute completeness:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCandidateData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (loading) return;

    if (window.$ && window.$.fn && window.$.fn.knob) {
      const $elm = window.$('.skills-percentage .dial');
      if ($elm.length) {
        $elm.each(function () {
          const elm = window.$(this);
          elm.knob({
            value: 0,
            min: 0,
            max: 100,
            skin: 'tron',
            readOnly: true,
            thickness: 0.45,
            dynamicDraw: true,
            displayInput: false,
          });

          window.$({ value: 0 }).animate(
            { value: percentage },
            {
              duration: speed,
              easing: 'swing',
              progress: function () {
                elm.val(Math.ceil(this.value)).trigger('change');
              },
            }
          );
        });

        const $t = window.$('.skills-percentage .pie-graph .count-box');
        $t.each(function () {
          const tBox = window.$(this);
          const r = speed;

          tBox.removeClass('counted');
          tBox.addClass('counted');
          window.$({ countNum: 0 }).animate(
            { countNum: percentage },
            {
              duration: r,
              easing: 'linear',
              step: function () {
                tBox.find('.count-text').text(Math.floor(this.countNum));
              },
              complete: function () {
                tBox.find('.count-text').text(percentage);
              },
            }
          );
        });
      }
    }
  }, [percentage, speed, loading]);

  const isComplete = percentage >= 100;
  const nextMissing = missingFields[0];

  return (
    <div className="skills-percentage">
      <h4>Profile & Skills</h4>

      {loading ? (
        <p className="text-muted small">Checking profile completeness...</p>
      ) : isComplete ? (
        <p className="text-success small mb-2">
          <i className="la la-check-circle mr-1"></i> Your profile is complete and verified!
        </p>
      ) : (
        <p className="small mb-2">
          Your profile is <strong>{percentage}%</strong> complete.{' '}
          {nextMissing && (
            <span>
              Add <strong>{nextMissing}</strong> to improve your profile.{' '}
            </span>
          )}
          <Link to="/candidate-dashboard/my-profile" className="text-primary font-weight-bold d-inline-block">
            Edit Profile &rarr;
          </Link>
        </p>
      )}

      {/* Pie Graph */}
      <div className="pie-graph">
        <div className="graph-outer">
          <input
            type="text"
            className="dial"
            data-fgcolor={isComplete ? '#34A853' : fgColor}
            data-bgcolor="transparent"
            data-width="234"
            data-height="234"
            data-linecap="normal"
            defaultValue={percentage}
            value={percentage}
            readOnly
          />
          <div className="inner-text count-box">
            <span className="count-text txt" data-stop={percentage} data-speed={speed}>
              {loading ? '...' : percentage}
            </span>
            %
          </div>
        </div>
      </div>

      {/* Display Actual Categories / Gig Sectors if present */}
      <div className="mt-3 px-2 text-center">
        {categories.length > 0 ? (
          <div>
            <div className="small font-weight-bold text-muted mb-1">Your Categories:</div>
            <div className="d-flex flex-wrap justify-content-center" style={{ gap: '4px' }}>
              {categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="badge badge-light border text-primary"
                  style={{ fontSize: '11px', fontWeight: '500', padding: '4px 8px' }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="small text-muted">
            No categories selected.{' '}
            <Link to="/candidate-dashboard/my-profile" className="text-primary font-weight-bold">
              Add Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSkillsPercentage;

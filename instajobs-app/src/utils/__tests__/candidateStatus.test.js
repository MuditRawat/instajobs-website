import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCanonicalStatus,
  getApplicationStatusConfig,
  APPLICATION_STATUS_INFO
} from '../candidateStatus.js';

test('Candidate Status Normalizer & Explanations', async (t) => {
  await t.test('resolves pending status and explanation', () => {
    const canonical = getCanonicalStatus('pending');
    assert.equal(canonical, 'pending');
    const config = getApplicationStatusConfig('pending');
    assert.equal(config.label, 'Pending');
    assert.equal(config.explanation, 'Your application has been received and is awaiting review.');
  });

  await t.test('resolves shortlisted status and explanation', () => {
    const canonical = getCanonicalStatus('shortlisted');
    assert.equal(canonical, 'shortlisted');
    const config = getApplicationStatusConfig('shortlisted');
    assert.equal(config.label, 'Shortlisted');
    assert.equal(config.explanation, 'Your application has been shortlisted by the employer.');
  });

  await t.test('resolves selected status and explanation', () => {
    const canonical = getCanonicalStatus('selected');
    assert.equal(canonical, 'selected');
    const config = getApplicationStatusConfig('selected');
    assert.equal(config.label, 'Selected');
    assert.equal(config.explanation, 'You have been selected by the employer.');

    // Legacy fallback mapping
    assert.equal(getCanonicalStatus('approved'), 'selected');
    assert.equal(getCanonicalStatus('accepted'), 'selected');
  });

  await t.test('resolves rejected status and explanation', () => {
    const canonical = getCanonicalStatus('rejected');
    assert.equal(canonical, 'rejected');
    const config = getApplicationStatusConfig('rejected');
    assert.equal(config.label, 'Rejected');
    assert.equal(config.explanation, 'The employer has decided not to proceed with your application.');
  });

  await t.test('respects isShortlisted boolean flag when provided', () => {
    assert.equal(getCanonicalStatus('pending', true), 'shortlisted');
  });
});

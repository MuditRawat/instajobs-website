import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Logic unit test for the homepage CV button click handler.
 * Verifies the three required scenarios:
 * 1. Logged in as a candidate -> navigates to /candidate-dashboard/cv-manager
 * 2. Logged out -> navigates to /login with state: { from: '/candidate-dashboard/cv-manager' }
 * 3. Logged in as an employer -> does nothing (no navigation)
 */

function handleUploadCvClick({ isAuthenticated, role, navigate, preventDefault }) {
  if (preventDefault) preventDefault();
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/candidate-dashboard/cv-manager' } });
    return;
  }
  if (role === 'candidate') {
    navigate('/candidate-dashboard/cv-manager');
    return;
  }
  // For logged-in employers, do nothing
}

describe('Homepage Upload Profile / CV Button Navigation Logic', () => {
  it('Scenario 1: Logged-in candidate navigates directly to CV Manager', () => {
    let navigatedTo = null;
    let navOptions = null;
    let defaultPrevented = false;

    handleUploadCvClick({
      isAuthenticated: true,
      role: 'candidate',
      navigate: (path, opts) => {
        navigatedTo = path;
        navOptions = opts;
      },
      preventDefault: () => {
        defaultPrevented = true;
      }
    });

    assert.equal(defaultPrevented, true);
    assert.equal(navigatedTo, '/candidate-dashboard/cv-manager');
    assert.equal(navOptions, undefined);
  });

  it('Scenario 2: Logged-out user navigates to /login with intended return state', () => {
    let navigatedTo = null;
    let navOptions = null;
    let defaultPrevented = false;

    handleUploadCvClick({
      isAuthenticated: false,
      role: null,
      navigate: (path, opts) => {
        navigatedTo = path;
        navOptions = opts;
      },
      preventDefault: () => {
        defaultPrevented = true;
      }
    });

    assert.equal(defaultPrevented, true);
    assert.equal(navigatedTo, '/login');
    assert.deepEqual(navOptions, { state: { from: '/candidate-dashboard/cv-manager' } });
  });

  it('Scenario 3: Logged-in employer does nothing', () => {
    let navigatedTo = null;
    let navOptions = null;
    let defaultPrevented = false;

    handleUploadCvClick({
      isAuthenticated: true,
      role: 'employer',
      navigate: (path, opts) => {
        navigatedTo = path;
        navOptions = opts;
      },
      preventDefault: () => {
        defaultPrevented = true;
      }
    });

    assert.equal(defaultPrevented, true);
    assert.equal(navigatedTo, null);
    assert.equal(navOptions, null);
  });
});


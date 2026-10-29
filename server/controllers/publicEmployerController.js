const PublicEmployerService = require('../services/publicEmployerService');

/**
 * Controller: Get Public Employers List
 * GET /api/employers (or /api/jobs/employers)
 */
const getPublicEmployers = async (req, res) => {
  try {
    const result = await PublicEmployerService.getPublicEmployers(req.query);
    return res.status(200).json({
      success: true,
      employers: result.employers,
      total: result.total,
      limit: result.limit,
      offset: result.offset
    });
  } catch (error) {
    console.error('[getPublicEmployers Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve employers list.'
    });
  }
};

/**
 * Controller: Get Single Public Employer by ID
 * GET /api/employers/:id (or /api/jobs/employers/:id)
 */
const getPublicEmployerById = async (req, res) => {
  try {
    const employerId = req.params.id;
    if (!employerId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Employer ID parameter is required.'
      });
    }

    const employer = await PublicEmployerService.getPublicEmployerById(employerId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Employer profile not found or is not publicly accessible.'
      });
    }

    return res.status(200).json({
      success: true,
      employer
    });
  } catch (error) {
    console.error('[getPublicEmployerById Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve employer details.'
    });
  }
};

module.exports = {
  getPublicEmployers,
  getPublicEmployerById
};


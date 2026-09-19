const JobService = require('../services/jobService');

/**
 * Validate job payload for create and update operations
 * @param {object} body - Request body
 * @param {boolean} isUpdate - True if performing an update operation
 * @returns {object} { isValid: boolean, message?: string }
 */
const validateJobInput = (body = {}, isUpdate = false) => {
  const { title, description, salary_min, salary_max } = body;

  // Title validation
  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return { isValid: false, message: 'Job title is required and cannot be empty.' };
    }
  }

  // Description validation
  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return { isValid: false, message: 'Job description is required and cannot be empty.' };
    }
  }

  // Salary Min validation
  let parsedMin = null;
  if (salary_min !== undefined && salary_min !== null && salary_min !== '') {
    parsedMin = Number(salary_min);
    if (isNaN(parsedMin)) {
      return { isValid: false, message: 'Minimum salary must be a valid number.' };
    }
    if (parsedMin < 0) {
      return { isValid: false, message: 'Minimum salary cannot be negative.' };
    }
  }

  // Salary Max validation
  let parsedMax = null;
  if (salary_max !== undefined && salary_max !== null && salary_max !== '') {
    parsedMax = Number(salary_max);
    if (isNaN(parsedMax)) {
      return { isValid: false, message: 'Maximum salary must be a valid number.' };
    }
    if (parsedMax < 0) {
      return { isValid: false, message: 'Maximum salary cannot be negative.' };
    }
  }

  // Range validation
  if (parsedMin !== null && parsedMax !== null) {
    if (parsedMin > parsedMax) {
      return { isValid: false, message: 'Minimum salary cannot exceed maximum salary.' };
    }
  }

  return { isValid: true };
};

/**
 * Controller: Create Job
 * POST /api/employer/jobs
 */
const createJob = async (req, res) => {
  try {
    if (req.user?.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only users with the employer role can perform job management operations.'
      });
    }

    const validation = validateJobInput(req.body, false);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: validation.message
      });
    }

    const job = await JobService.createJob(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: job
    });
  } catch (error) {
    console.error('[createJob Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
      message: error.message || 'Failed to create job.'
    });
  }
};

/**
 * Controller: Get Employer Jobs
 * GET /api/employer/jobs
 */
const getEmployerJobs = async (req, res) => {
  try {
    if (req.user?.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only users with the employer role can perform job management operations.'
      });
    }

    const jobs = await JobService.getEmployerJobs(req.user.id);

    return res.status(200).json({
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('[getEmployerJobs Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve employer jobs.'
    });
  }
};

/**
 * Controller: Get Single Employer Job
 * GET /api/employer/jobs/:id
 */
const getEmployerJob = async (req, res) => {
  try {
    if (req.user?.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only users with the employer role can perform job management operations.'
      });
    }

    const jobId = req.params.id;
    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID parameter is required.'
      });
    }

    const job = await JobService.getEmployerJob(req.user.id, jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Job not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      job: job
    });
  } catch (error) {
    console.error('[getEmployerJob Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve job.'
    });
  }
};

/**
 * Controller: Update Job
 * PUT /api/employer/jobs/:id
 */
const updateJob = async (req, res) => {
  try {
    if (req.user?.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only users with the employer role can perform job management operations.'
      });
    }

    const jobId = req.params.id;
    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID parameter is required.'
      });
    }

    const validation = validateJobInput(req.body, true);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: validation.message
      });
    }

    const updatedJob = await JobService.updateJob(req.user.id, jobId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('[updateJob Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: statusCode === 404 ? 'Not Found' : statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
      message: error.message || 'Failed to update job.'
    });
  }
};

/**
 * Controller: Update Job Status (active / inactive)
 * PATCH /api/employer/jobs/:id/status
 */
const updateJobStatus = async (req, res) => {
  try {
    if (req.user?.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only users with the employer role can perform job management operations.'
      });
    }

    const jobId = req.params.id;
    const { status } = req.body || {};

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID parameter is required.'
      });
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Status is required and must be either "active" or "inactive".'
      });
    }

    const updatedJob = await JobService.updateJobStatus(req.user.id, jobId, status);

    return res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('[updateJobStatus Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: statusCode === 404 ? 'Not Found' : statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
      message: error.message || 'Failed to update job status.'
    });
  }
};

/**
 * Controller: Soft Delete Job
 * DELETE /api/employer/jobs/:id
 */
const deleteJob = async (req, res) => {
  try {
    if (req.user?.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only users with the employer role can perform job management operations.'
      });
    }

    const jobId = req.params.id;
    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID parameter is required.'
      });
    }

    const deletedJob = await JobService.softDeleteJob(req.user.id, jobId);

    return res.status(200).json({
      success: true,
      message: 'Job soft-deleted successfully',
      job: deletedJob
    });
  } catch (error) {
    console.error('[deleteJob Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: error.message || 'Failed to delete job.'
    });
  }
};

/**
 * Controller: Get Public Jobs
 * GET /api/jobs
 */
const getPublicJobs = async (req, res) => {
  try {
    const result = await JobService.getPublicJobs(req.query);
    return res.status(200).json({
      success: true,
      jobs: result.jobs,
      total: result.total,
      limit: result.limit,
      offset: result.offset
    });
  } catch (error) {
    console.error('[getPublicJobs Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve public jobs.'
    });
  }
};

/**
 * Controller: Get Single Public Job by ID
 * GET /api/jobs/:id
 */
const getPublicJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID parameter is required.'
      });
    }

    const job = await JobService.getPublicJobById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Job not found or is no longer active.'
      });
    }

    return res.status(200).json({
      success: true,
      job: job
    });
  } catch (error) {
    console.error('[getPublicJobById Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve job.'
    });
  }
};

/**
 * Controller: Get Active Job Categories with Job Counts
 * GET /api/jobs/categories
 */
const getJobCategories = async (req, res) => {
  try {
    const result = await JobService.getJobCategories();
    return res.status(200).json({
      success: true,
      categories: result.categories,
      totalJobs: result.totalJobs,
      jobsAddedToday: result.jobsAddedToday
    });
  } catch (error) {
    console.error('[getJobCategories Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve job categories.'
    });
  }
};

/**
 * Controller: Get Popular Cities with Active Job Counts
 * GET /api/jobs/cities
 */
const getPopularCities = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
    const result = await JobService.getPopularCities(limit);
    return res.status(200).json({
      success: true,
      cities: result.cities,
      totalJobs: result.totalJobs
    });
  } catch (error) {
    console.error('[getPopularCities Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve popular cities.'
    });
  }
};

module.exports = {
  createJob,
  getEmployerJobs,
  getEmployerJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getPublicJobs,
  getPublicJobById,
  getJobCategories,
  getPopularCities
};

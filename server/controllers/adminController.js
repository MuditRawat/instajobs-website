const AdminService = require('../services/adminService');

/**
 * Controller: List employers with status filter, search keyword, category, country, sorting, and pagination
 * GET /api/admin/employers?status=...&search=...&category=...&country=...&sort=...&page=...&limit=...
 */
const getEmployers = async (req, res) => {
  try {
    const { status, search, category, country, sort, page, limit } = req.query;
    const result = await AdminService.getEmployers({
      status,
      search,
      category,
      country,
      sort,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      count: result.count,
      total: result.total,
      employers: result.employers,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('[Admin getEmployers Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : 'Internal Server Error'),
      message: error.message || 'Failed to retrieve employers.'
    });
  }
};

/**
 * Controller: Export filtered employer dataset as CSV
 * GET /api/admin/employers/export?status=...&search=...&category=...&country=...&sort=...
 */
const exportEmployers = async (req, res) => {
  try {
    const { status, search, category, country, sort } = req.query;
    const csvContent = await AdminService.exportEmployersCsv({
      status,
      search,
      category,
      country,
      sort
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="employers.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('[Admin exportEmployers Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : 'Internal Server Error'),
      message: error.message || 'Failed to export employers.'
    });
  }
};

/**
 * Controller: Update employer approval status
 * PATCH /api/admin/employers/:id/approval-status
 */
const updateEmployerApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_status } = req.body || {};

    const updatedEmployer = await AdminService.updateEmployerApprovalStatus(id, approval_status);

    return res.status(200).json({
      success: true,
      message: `Employer approval status updated to '${updatedEmployer.approval_status}' successfully.`,
      employer: updatedEmployer
    });
  } catch (error) {
    console.error('[Admin updateEmployerApprovalStatus Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 404 ? 'Not Found' : 'Internal Server Error'),
      message: error.message || 'Failed to update employer approval status.'
    });
  }
};

/**
 * Controller: Get single employer profile details by ID
 * GET /api/admin/employers/:id
 */
const getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AdminService.getEmployerById(id);

    return res.status(200).json({
      success: true,
      employer: result.employer,
      summary: result.summary
    });
  } catch (error) {
    console.error('[Admin getEmployerById Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 404 ? 'Not Found' : 'Internal Server Error'),
      message: error.message || 'Failed to retrieve employer details.'
    });
  }
};

/**
 * Controller: Get all jobs posted by a specific employer
 * GET /api/admin/employers/:id/jobs
 */
const getEmployerJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await AdminService.getEmployerJobs(id);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobs
    });
  } catch (error) {
    console.error('[Admin getEmployerJobs Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 404 ? 'Not Found' : 'Internal Server Error'),
      message: error.message || 'Failed to retrieve employer jobs.'
    });
  }
};

/**
 * Controller: Get admin dashboard statistics
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const stats = await AdminService.getDashboardStats();

    return res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('[Admin getDashboardStats Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Internal Server Error',
      message: error.message || 'Failed to retrieve dashboard statistics.'
    });
  }
};

module.exports = {
  getEmployers,
  exportEmployers,
  updateEmployerApprovalStatus,
  getEmployerById,
  getEmployerJobs,
  getDashboardStats
};

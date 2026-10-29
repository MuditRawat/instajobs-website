const CandidateResumeService = require('../services/candidateResumeService');
const { isValidDocxPackage } = require('../utils/fileValidation');

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Helper: Parse multipart/form-data buffer for file field 'cv' or 'resume' or any attached file
 */
function parseCvMultipartBuffer(rawBuffer, contentTypeHeader) {
  if (!rawBuffer || rawBuffer.length === 0 || !contentTypeHeader) return null;
  const match = contentTypeHeader.match(/boundary=([^;]+)/i);
  if (!match) return null;
  let boundary = match[1].trim();
  if (boundary.startsWith('"') && boundary.endsWith('"')) {
    boundary = boundary.substring(1, boundary.length - 1);
  }

  const boundaryBuf = Buffer.from('--' + boundary);
  let offset = 0;

  while (offset < rawBuffer.length) {
    const bIndex = rawBuffer.indexOf(boundaryBuf, offset);
    if (bIndex === -1) break;

    const partStart = bIndex + boundaryBuf.length;
    const nextBIndex = rawBuffer.indexOf(boundaryBuf, partStart);
    const partEnd = nextBIndex === -1 ? rawBuffer.length : nextBIndex;

    const part = rawBuffer.subarray(partStart, partEnd);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const headerText = part.subarray(0, headerEnd).toString('utf8');
      let bodyData = part.subarray(headerEnd + 4);

      if (bodyData.length >= 2 && bodyData[bodyData.length - 2] === 13 && bodyData[bodyData.length - 1] === 10) {
        bodyData = bodyData.subarray(0, bodyData.length - 2);
      }

      const isFileField = headerText.includes('filename=') || headerText.includes('name="cv"') || headerText.includes('name="resume"') || headerText.includes('name="file"');
      if (isFileField && bodyData.length > 0) {
        let filename = 'resume.pdf';
        const fnMatch = headerText.match(/filename="([^"]+)"/);
        if (fnMatch) filename = fnMatch[1];

        let mimeType = 'application/pdf';
        const mimeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);
        if (mimeMatch) mimeType = mimeMatch[1].trim();

        return { buffer: bodyData, filename, mimeType, size: bodyData.length };
      }
    }

    offset = partEnd;
  }

  return null;
}

/**
 * Helper: Collect raw request stream if not already buffered
 */
function getRawStreamBuffer(req) {
  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    return Promise.resolve(req.body);
  }
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return Promise.resolve(Buffer.from([]));
  }
  if (req.readableEnded) {
    return Promise.resolve(Buffer.from([]));
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

/**
 * Inspect magic bytes of uploaded buffer to strictly confirm PDF or DOCX format
 */
function inspectCvBuffer(buffer, filenameHint = '') {
  if (!buffer || buffer.length === 0) {
    const err = new Error('Uploaded file is empty.');
    err.statusCode = 400;
    throw err;
  }

  if (buffer.length > MAX_CV_SIZE_BYTES) {
    const err = new Error('CV file exceeds the maximum permitted limit of 5 MB.');
    err.statusCode = 400;
    throw err;
  }

  // 1. PDF: %PDF-
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return {
      detectedMime: 'application/pdf',
      ext: 'pdf'
    };
  }

  // 2. DOCX: ZIP Local File Header + Valid OPC Structure
  if (
    buffer.length >= 30 &&
    buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04
  ) {
    if (isValidDocxPackage(buffer)) {
      return {
        detectedMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ext: 'docx'
      };
    }
  }

  const err = new Error('Unsupported file format. Only PDF (.pdf) and Word DOCX (.docx) documents are permitted.');
  err.statusCode = 400;
  throw err;
}

/**
 * GET /api/candidate/cvs
 * List all CVs for the authenticated candidate
 */
const listCvs = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only registered candidates can access their CV library.'
      });
    }

    const cvs = await CandidateResumeService.listCandidateCvs(userId);

    return res.status(200).json({
      success: true,
      count: cvs.length,
      cvs
    });
  } catch (error) {
    console.error('[listCvs Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Failed to list CVs',
      message: error.message || 'An error occurred while retrieving your CV library.'
    });
  }
};

/**
 * POST /api/candidate/cvs
 * Upload a new CV file via multipart/form-data
 */
const uploadCv = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only registered candidates can upload CVs.'
      });
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Request must be multipart/form-data containing the CV file.'
      });
    }

    const rawBuffer = await getRawStreamBuffer(req);
    const parsed = parseCvMultipartBuffer(rawBuffer, contentType);

    if (!parsed || !parsed.buffer || parsed.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No CV file was received in the upload payload.'
      });
    }

    // Inspect magic bytes
    const inspection = inspectCvBuffer(parsed.buffer, parsed.filename);
    const finalFileData = {
      buffer: parsed.buffer,
      filename: parsed.filename,
      mimeType: inspection.detectedMime,
      size: parsed.buffer.length
    };

    const newCv = await CandidateResumeService.uploadCandidateCv(userId, finalFileData);

    return res.status(201).json({
      success: true,
      message: 'CV uploaded successfully.',
      cv: newCv
    });
  } catch (error) {
    console.error('[uploadCv Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Upload Error',
      message: error.message || 'Failed to upload CV.'
    });
  }
};

/**
 * GET /api/candidate/cvs/:id/download
 * Generate a short-lived signed URL to securely view/download a CV
 */
const getCvDownloadUrl = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const cvId = req.params.id;

    if (!userId || role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only registered candidates can access their CV files.'
      });
    }

    if (!cvId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'CV ID parameter is required.'
      });
    }

    const result = await CandidateResumeService.getCvSignedUrl(userId, cvId);

    return res.status(200).json({
      success: true,
      signedUrl: result.signedUrl,
      fileName: result.fileName,
      expiresIn: result.expiresIn
    });
  } catch (error) {
    console.error('[getCvDownloadUrl Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Download Error',
      message: error.message || 'Failed to generate download URL.'
    });
  }
};

/**
 * PUT /api/candidate/cvs/:id/default
 * Set a CV as the primary default
 */
const setDefaultCv = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const cvId = req.params.id;

    if (!userId || role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only registered candidates can set their default CV.'
      });
    }

    if (!cvId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'CV ID parameter is required.'
      });
    }

    const updated = await CandidateResumeService.setDefaultCv(userId, cvId);

    return res.status(200).json({
      success: true,
      message: 'Default CV updated successfully.',
      cv: updated
    });
  } catch (error) {
    console.error('[setDefaultCv Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Default Update Error',
      message: error.message || 'Failed to update default CV.'
    });
  }
};

/**
 * PUT /api/candidate/cvs/:id
 * Replace the file of an existing CV
 */
const replaceCv = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const cvId = req.params.id;

    if (!userId || role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only registered candidates can replace their CV.'
      });
    }

    if (!cvId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'CV ID parameter is required.'
      });
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Request must be multipart/form-data containing the replacement CV file.'
      });
    }

    const rawBuffer = await getRawStreamBuffer(req);
    const parsed = parseCvMultipartBuffer(rawBuffer, contentType);

    if (!parsed || !parsed.buffer || parsed.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No replacement CV file was received.'
      });
    }

    const inspection = inspectCvBuffer(parsed.buffer, parsed.filename);
    const finalFileData = {
      buffer: parsed.buffer,
      filename: parsed.filename,
      mimeType: inspection.detectedMime,
      size: parsed.buffer.length
    };

    const updated = await CandidateResumeService.replaceCandidateCv(userId, cvId, finalFileData);

    return res.status(200).json({
      success: true,
      message: 'CV replaced successfully.',
      cv: updated
    });
  } catch (error) {
    console.error('[replaceCv Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Replace Error',
      message: error.message || 'Failed to replace CV.'
    });
  }
};

/**
 * DELETE /api/candidate/cvs/:id
 * Delete a CV from the candidate library
 */
const deleteCv = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const cvId = req.params.id;

    if (!userId || role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only registered candidates can delete their CVs.'
      });
    }

    if (!cvId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'CV ID parameter is required.'
      });
    }

    const result = await CandidateResumeService.deleteCandidateCv(userId, cvId);

    return res.status(200).json({
      success: true,
      message: 'CV deleted successfully.',
      ...result
    });
  } catch (error) {
    console.error('[deleteCv Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Delete Error',
      message: error.message || 'Failed to delete CV.'
    });
  }
};

module.exports = {
  listCvs,
  uploadCv,
  getCvDownloadUrl,
  setDefaultCv,
  replaceCv,
  deleteCv
};


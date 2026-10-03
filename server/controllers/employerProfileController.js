const EmployerProfileService = require('../services/employerProfileService');
const supabase = require('../config/supabase');

/**
 * Helper: Inspect image buffer header for MIME type and dimensions (JPEG, PNG, WebP)
 */
function inspectImageBuffer(buffer) {
  if (!buffer || buffer.length < 8) return null;

  // 1. PNG Signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    if (buffer.length < 24) return null;
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { mime: 'image/png', width, height };
  }

  // 2. JPEG Signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { mime: 'image/jpeg', width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
    return null;
  }

  // 3. WebP Signature: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    if (buffer.length < 30) return null;
    const vp8Chunk = buffer.subarray(12, 16).toString('ascii');
    if (vp8Chunk === 'VP8 ') {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { mime: 'image/webp', width, height };
    } else if (vp8Chunk === 'VP8L') {
      const b1 = buffer[21];
      const b2 = buffer[22];
      const b3 = buffer[23];
      const b4 = buffer[24];
      const width = 1 + (((b2 & 0x3f) << 8) | b1);
      const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
      return { mime: 'image/webp', width, height };
    } else if (vp8Chunk === 'VP8X') {
      const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
      const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
      return { mime: 'image/webp', width, height };
    }
    return { mime: 'image/webp', width: 0, height: 0 };
  }

  return null;
}

/**
 * Helper: Parse multipart/form-data buffer for file fields
 */
function parseMultipartBuffer(rawBuffer, contentTypeHeader, fieldNames = []) {
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

      const hasFilename = headerText.includes('filename=');
      const matchesFieldName = fieldNames.some((fn) => headerText.includes(`name="${fn}"`));
      const isFileField = hasFilename || matchesFieldName || fieldNames.length === 0;

      if (isFileField && bodyData.length > 0) {
        let filename = 'upload.png';
        const fnMatch = headerText.match(/filename="([^"]+)"/);
        if (fnMatch) filename = fnMatch[1];

        let mimeType = 'image/png';
        const mimeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);
        if (mimeMatch) mimeType = mimeMatch[1].trim();

        return { fileBuffer: bodyData, filename, mimeType };
      }
    }

    offset = partEnd;
  }

  return null;
}

/**
 * Helper: Collect raw request body buffer if not already parsed
 */
function getRawBodyBuffer(req) {
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
 * Helper: Extract storage path belonging to this specific user from a public URL
 */
function extractStoragePath(url, folderPrefix, userId) {
  if (!url || typeof url !== 'string') return null;
  const escapedUserId = userId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${folderPrefix}/${escapedUserId}/[^?#\\s]+)`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Controller: Get Employer Profile
 * GET /api/employer/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employer accounts can access the employer profile.'
      });
    }

    const profile = await EmployerProfileService.getEmployerProfile(userId);

    const userEmail = (req.user?.email && typeof req.user.email === 'string' && req.user.email.includes('@')) ? req.user.email : null;

    return res.status(200).json({
      success: true,
      profile: profile,
      user: {
        id: req.user.id,
        email: userEmail,
        authMethod: req.user?.authMethod || 'email'
      }
    });
  } catch (error) {
    console.error('[getEmployerProfile Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve employer profile.'
    });
  }
};

/**
 * Controller: Update Employer Profile
 * PUT /api/employer/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employer accounts can update the employer profile.'
      });
    }

    const authMethod = req.user?.authMethod || 'email';
    const updatedProfile = await EmployerProfileService.updateEmployerProfile(userId, req.body || {}, authMethod);

    const userEmail = (req.user?.email && typeof req.user.email === 'string' && req.user.email.includes('@')) ? req.user.email : null;

    return res.status(200).json({
      success: true,
      message: 'Employer profile updated successfully',
      profile: updatedProfile,
      user: {
        id: req.user.id,
        email: userEmail,
        authMethod: req.user?.authMethod || 'email'
      }
    });
  } catch (error) {
    console.error('[updateEmployerProfile Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to update employer profile.'
    });
  }
};

/**
 * Controller: Upload Employer Company Logo
 * POST /api/employer/profile/logo or POST /api/employer/logo
 */
const uploadLogo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employer accounts can upload a company logo.'
      });
    }

    const contentType = req.headers['content-type'] || '';
    let fileBuffer = null;
    let filenameHint = 'logo.png';

    const rawBuffer = await getRawBodyBuffer(req);

    if (contentType.toLowerCase().includes('multipart/form-data')) {
      const parsed = parseMultipartBuffer(rawBuffer, contentType, ['logo', 'attachments', 'attachments[]', 'file', 'image']);
      if (parsed) {
        fileBuffer = parsed.fileBuffer;
        filenameHint = parsed.filename;
      }
    } else if (contentType.toLowerCase().includes('json') && req.body && (req.body.logo_base64 || req.body.file || req.body.logo || req.body.avatar)) {
      const b64Data = req.body.logo_base64 || req.body.file || req.body.logo || req.body.avatar;
      const cleanB64 = typeof b64Data === 'string' ? b64Data.replace(/^data:image\/\w+;base64,/, '') : '';
      if (cleanB64) {
        fileBuffer = Buffer.from(cleanB64, 'base64');
      }
      if (req.body.filename) filenameHint = req.body.filename;
    } else if (rawBuffer && rawBuffer.length > 0) {
      fileBuffer = rawBuffer;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No file uploaded. Please select an image file.'
      });
    }

    // File size validation (1 MB = 1,048,576 bytes)
    const MAX_SIZE = 1 * 1024 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(413).json({
        success: false,
        error: 'Payload Too Large',
        message: 'File size exceeds the maximum limit of 1 MB.'
      });
    }

    // File signature & dimension validation
    const imageInfo = inspectImageBuffer(fileBuffer);
    if (!imageInfo) {
      return res.status(415).json({
        success: false,
        error: 'Unsupported Media Type',
        message: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP images are allowed. PDF and document files are not accepted.'
      });
    }

    if (imageInfo.width < 330 || imageInfo.height < 300) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Image dimensions (${imageInfo.width}x${imageInfo.height}px) are below the minimum required dimensions of 330x300px.`
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Supabase backend client is not configured.'
      });
    }

    // Retrieve previous profile to find existing logo for replacement cleanup
    const currentProfile = await EmployerProfileService.getEmployerProfile(userId);
    const oldLogoUrl = currentProfile?.logo_url;

    // Construct isolated employer storage path
    const extension = imageInfo.mime === 'image/jpeg' ? 'jpg' : imageInfo.mime === 'image/webp' ? 'webp' : 'png';
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = `employer-logos/${userId}/${safeFileName}`;

    // Upload to Supabase Storage 'avatars' bucket
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: imageInfo.mime,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadErr) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: `Logo upload to storage failed: ${uploadErr.message}`
      });
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      await supabase.storage.from('avatars').remove([filePath]).catch(() => {});
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate public URL for uploaded logo.'
      });
    }

    // Persist logo_url in employer_profiles
    try {
      const updatedProfile = await EmployerProfileService.updateEmployerProfile(userId, { logo_url: publicUrl });

      // Clean up previous employer-owned image from storage
      const oldStoragePath = extractStoragePath(oldLogoUrl, 'employer-logos', userId);
      if (oldStoragePath && oldStoragePath !== filePath) {
        await supabase.storage.from('avatars').remove([oldStoragePath]).catch((cleanupErr) => {
          console.warn('[Storage Cleanup Warning] Failed to delete previous logo:', cleanupErr?.message);
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Company logo uploaded and saved successfully',
        logo_url: publicUrl,
        profile: updatedProfile
      });
    } catch (dbErr) {
      // Clean up uploaded file on DB error to avoid orphaned storage files
      await supabase.storage.from('avatars').remove([filePath]).catch(() => {});
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: `Failed to update employer profile record: ${dbErr.message}`
      });
    }
  } catch (error) {
    console.error('[uploadLogo Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to process logo upload.'
    });
  }
};

/**
 * Controller: Upload Employer Company Cover
 * POST /api/employer/profile/cover or POST /api/employer/cover
 */
const uploadCover = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employer accounts can upload a company cover image.'
      });
    }

    const contentType = req.headers['content-type'] || '';
    let fileBuffer = null;
    let filenameHint = 'cover.png';

    const rawBuffer = await getRawBodyBuffer(req);

    if (contentType.toLowerCase().includes('multipart/form-data')) {
      const parsed = parseMultipartBuffer(rawBuffer, contentType, ['cover', 'attachments', 'attachments[]', 'file', 'image']);
      if (parsed) {
        fileBuffer = parsed.fileBuffer;
        filenameHint = parsed.filename;
      }
    } else if (contentType.toLowerCase().includes('json') && req.body && (req.body.cover_base64 || req.body.file || req.body.cover || req.body.avatar)) {
      const b64Data = req.body.cover_base64 || req.body.file || req.body.cover || req.body.avatar;
      const cleanB64 = typeof b64Data === 'string' ? b64Data.replace(/^data:image\/\w+;base64,/, '') : '';
      if (cleanB64) {
        fileBuffer = Buffer.from(cleanB64, 'base64');
      }
      if (req.body.filename) filenameHint = req.body.filename;
    } else if (rawBuffer && rawBuffer.length > 0) {
      fileBuffer = rawBuffer;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No file uploaded. Please select an image file.'
      });
    }

    // File size validation (1 MB = 1,048,576 bytes)
    const MAX_SIZE = 1 * 1024 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(413).json({
        success: false,
        error: 'Payload Too Large',
        message: 'File size exceeds the maximum limit of 1 MB.'
      });
    }

    // File signature & dimension validation
    const imageInfo = inspectImageBuffer(fileBuffer);
    if (!imageInfo) {
      return res.status(415).json({
        success: false,
        error: 'Unsupported Media Type',
        message: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP images are allowed. PDF and document files are not accepted.'
      });
    }

    if (imageInfo.width < 330 || imageInfo.height < 300) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Image dimensions (${imageInfo.width}x${imageInfo.height}px) are below the minimum required dimensions of 330x300px.`
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Supabase backend client is not configured.'
      });
    }

    // Retrieve previous profile to find existing cover for replacement cleanup
    const currentProfile = await EmployerProfileService.getEmployerProfile(userId);
    const oldCoverUrl = currentProfile?.cover_url;

    // Construct isolated employer storage path
    const extension = imageInfo.mime === 'image/jpeg' ? 'jpg' : imageInfo.mime === 'image/webp' ? 'webp' : 'png';
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = `employer-covers/${userId}/${safeFileName}`;

    // Upload to Supabase Storage 'avatars' bucket
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: imageInfo.mime,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadErr) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: `Cover upload to storage failed: ${uploadErr.message}`
      });
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      await supabase.storage.from('avatars').remove([filePath]).catch(() => {});
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate public URL for uploaded cover.'
      });
    }

    // Persist cover_url in employer_profiles
    try {
      const updatedProfile = await EmployerProfileService.updateEmployerProfile(userId, { cover_url: publicUrl });

      // Clean up previous employer-owned image from storage
      const oldStoragePath = extractStoragePath(oldCoverUrl, 'employer-covers', userId);
      if (oldStoragePath && oldStoragePath !== filePath) {
        await supabase.storage.from('avatars').remove([oldStoragePath]).catch((cleanupErr) => {
          console.warn('[Storage Cleanup Warning] Failed to delete previous cover:', cleanupErr?.message);
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Company cover uploaded and saved successfully',
        cover_url: publicUrl,
        profile: updatedProfile
      });
    } catch (dbErr) {
      // Clean up uploaded file on DB error to avoid orphaned storage files
      await supabase.storage.from('avatars').remove([filePath]).catch(() => {});
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: `Failed to update employer profile record: ${dbErr.message}`
      });
    }
  } catch (error) {
    console.error('[uploadCover Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to process cover upload.'
    });
  }
};

/**
 * Controller: Delete Employer Profile, Jobs, and Account
 * DELETE /api/employer/profile
 */
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employer accounts can perform employer profile deletion.'
      });
    }

    const result = await EmployerProfileService.deleteEmployerAccount(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[deleteEmployerProfile Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to delete employer profile, jobs, and account.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadLogo,
  uploadCover,
  deleteProfile
};


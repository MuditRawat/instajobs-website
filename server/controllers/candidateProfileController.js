const CandidateProfileService = require('../services/candidateProfileService');

/**
 * Controller: Get Candidate Profile
 * GET /api/candidate/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    const profile = await CandidateProfileService.getCandidateProfile(userId);

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
    console.error('[getProfile Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve candidate profile.'
    });
  }
};

/**
 * Controller: Update Candidate Profile
 * PUT /api/candidate/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const authMethod = req.user?.authMethod || 'email';

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    const {
      full_name,
      phone,
      email,
      job_title,
      website,
      current_salary,
      expected_salary,
      experience_level,
      age,
      education_level,
      languages,
      categories,
      allow_search,
      bio,
      avatar_url,
      cover_url,
      social_links,
      country,
      city,
      address
    } = req.body || {};

    // 1. If phone-registered account, allow updating users.email and ENFORCE candidate_profiles.phone immutability
    if (authMethod === 'phone') {
      if (email !== undefined && email !== null) {
        const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (cleanEmail && !cleanEmail.includes('@')) {
          return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Please enter a valid email address.'
          });
        }
        if (cleanEmail) {
          const { error: emailUpdateErr } = await supabase
            .from('users')
            .update({ email: cleanEmail, updated_at: new Date().toISOString() })
            .eq('id', userId);

          if (emailUpdateErr) {
            return res.status(500).json({
              success: false,
              error: 'Internal Server Error',
              message: `Failed to update email address: ${emailUpdateErr.message}`
            });
          }
          req.user.email = cleanEmail;
        }
      }
    } else if (authMethod === 'email' && email !== undefined && email !== null) {
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      const currentEmail = req.user?.email ? req.user.email.trim().toLowerCase() : '';
      if (cleanEmail && currentEmail && cleanEmail !== currentEmail) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          code: 'EMAIL_ADDRESS_READONLY',
          message: 'Verified email address cannot be modified.'
        });
      }
    }

    const fields = {
      full_name,
      // Protect verified phone number from modification if account is phone-registered
      phone: authMethod === 'phone' ? undefined : phone,
      job_title,
      website,
      current_salary,
      expected_salary,
      experience_level,
      age,
      education_level,
      languages,
      categories,
      allow_search,
      bio,
      avatar_url,
      cover_url,
      social_links,
      country,
      city,
      address
    };

    const updatePayload = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) {
        updatePayload[key] = val;
      }
    }

    const updatedProfile = await CandidateProfileService.updateCandidateProfile(userId, updatePayload, authMethod);
    const userEmail = (req.user?.email && typeof req.user.email === 'string' && req.user.email.includes('@')) ? req.user.email : null;

    return res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully',
      profile: updatedProfile,
      user: {
        id: req.user.id,
        email: userEmail,
        authMethod: authMethod
      }
    });
  } catch (error) {
    console.error('[updateProfile Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to update candidate profile.'
    });
  }
};

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
 * Helper: Parse multipart/form-data buffer for file field 'avatar'
 */
function parseMultipartBuffer(rawBuffer, contentTypeHeader) {
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

      const isFileField = headerText.includes('filename=') || headerText.includes('name="avatar"');
      if (isFileField && bodyData.length > 0) {
        let filename = 'avatar.png';
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

const supabase = require('../config/supabase');

/**
 * Controller: Upload Candidate Avatar
 * POST /api/candidate/avatar
 */
const uploadAvatar = async (req, res) => {
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

    if (role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only candidate accounts can upload an avatar.'
      });
    }

    const contentType = req.headers['content-type'] || '';
    let fileBuffer = null;
    let filenameHint = 'avatar.png';

    const rawBuffer = await getRawBodyBuffer(req);

    if (contentType.toLowerCase().includes('multipart/form-data')) {
      const parsed = parseMultipartBuffer(rawBuffer, contentType);
      if (parsed) {
        fileBuffer = parsed.fileBuffer;
        filenameHint = parsed.filename;
      }
    } else if (contentType.toLowerCase().includes('json') && req.body && (req.body.avatar_base64 || req.body.file || req.body.avatar)) {
      const b64Data = req.body.avatar_base64 || req.body.file || req.body.avatar;
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

    // File type & dimension validation
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

    // Construct isolated storage path
    const extension = imageInfo.mime === 'image/jpeg' ? 'jpg' : imageInfo.mime === 'image/webp' ? 'webp' : 'png';
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = `candidate-avatars/${userId}/${safeFileName}`;

    // Upload to Supabase Storage 'avatars' bucket using SUPABASE_SERVICE_ROLE_KEY
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
        message: `Avatar upload to storage failed: ${uploadErr.message}`
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
        message: 'Failed to generate public URL for uploaded avatar.'
      });
    }

    // Save avatar_url to candidate_profiles in PostgreSQL
    try {
      const updatedProfile = await CandidateProfileService.updateCandidateProfile(userId, { avatar_url: publicUrl });

      return res.status(200).json({
        success: true,
        message: 'Avatar uploaded and saved successfully',
        avatar_url: publicUrl,
        profile: updatedProfile
      });
    } catch (dbErr) {
      // Orphan file cleanup on DB failure
      await supabase.storage.from('avatars').remove([filePath]).catch(() => {});
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: `Failed to update candidate profile record: ${dbErr.message}`
      });
    }
  } catch (error) {
    console.error('[uploadAvatar Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to process avatar upload.'
    });
  }
};

/**
 * Controller: Delete Candidate Profile and Account
 * DELETE /api/candidate/profile
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

    if (role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only candidate accounts can perform candidate profile deletion.'
      });
    }

    const result = await CandidateProfileService.deleteCandidateAccount(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[deleteCandidateProfile Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to delete candidate profile and account.'
    });
  }
};

/**
 * Controller: Get Candidate KYC Status
 * GET /api/candidate/kyc
 */
const getKycStatus = async (req, res) => {
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

    if (role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only candidate accounts can access candidate KYC status.'
      });
    }

    const profile = await CandidateProfileService.getCandidateProfile(userId);
    if (!profile || !profile.id) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Candidate profile record not found.'
      });
    }

    const { data: kyc, error } = await supabase
      .from('candidate_kyc')
      .select('id, candidate_id, legal_full_name, phone, email, address, live_latitude, live_longitude, geo_captured_at, consent_timestamp, status, created_at, updated_at')
      .eq('candidate_id', profile.id)
      .maybeSingle();

    if (error) {
      console.error('[getKycStatus DB Error]', error);
      // If table is missing from schema cache, report clear actionable status rather than crashing
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return res.status(200).json({
          success: true,
          hasKyc: false,
          kyc: null,
          schemaPending: true,
          notice: 'Database migration 004_minimal_kyc_and_interview_demo.sql is pending execution in Supabase.'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: `Failed to retrieve candidate KYC information: ${error.message}`
      });
    }

    return res.status(200).json({
      success: true,
      hasKyc: !!kyc,
      kyc: kyc || null
    });
  } catch (error) {
    console.error('[getKycStatus Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve KYC status.'
    });
  }
};

/**
 * Controller: Submit Reusable Candidate KYC
 * POST /api/candidate/kyc
 */
const submitKyc = async (req, res) => {
  const inFlightPaths = [];
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

    if (role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only candidate accounts can submit candidate KYC.'
      });
    }

    const profile = await CandidateProfileService.getCandidateProfile(userId);
    if (!profile || !profile.id) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Candidate profile record not found.'
      });
    }

    const candidateId = profile.id;

    // 1. KYC REUSE CHECK: If candidate already has a committed KYC record, return it immediately without uploading
    const { data: existingKyc, error: checkKycErr } = await supabase
      .from('candidate_kyc')
      .select('id, candidate_id, legal_full_name, phone, email, address, live_latitude, live_longitude, geo_captured_at, consent_timestamp, status, created_at, updated_at')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (checkKycErr) {
      console.error('[submitKyc Existing KYC Check Error]', checkKycErr);
      if (checkKycErr.code === 'PGRST205' || checkKycErr.message?.includes('schema cache')) {
        return res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          code: 'DATABASE_MIGRATION_REQUIRED',
          message: 'The candidate_kyc table is not initialized in the database. Please execute migration 004_minimal_kyc_and_interview_demo.sql in Supabase SQL editor.'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: `Failed to verify existing candidate KYC records: ${checkKycErr.message}`
      });
    }

    if (existingKyc) {
      return res.status(200).json({
        success: true,
        message: 'KYC record already exists and is reusable.',
        reused: true,
        kyc: existingKyc
      });
    }

    const {
      legal_full_name,
      phone,
      email,
      address,
      latitude,
      longitude,
      consent_given,
      selfie_base64,
      aadhaar_base64
    } = req.body || {};

    if (consent_given !== true) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Explicit affirmative consent is required to submit KYC.'
      });
    }

    const numLat = Number(latitude);
    const numLng = Number(longitude);
    if (
      isNaN(numLat) || isNaN(numLng) ||
      numLat < -90 || numLat > 90 ||
      numLng < -180 || numLng > 180
    ) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Valid live location coordinates (latitude and longitude) are required.'
      });
    }

    if (!legal_full_name || typeof legal_full_name !== 'string' || !legal_full_name.trim()) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'Legal full name is required.' });
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'Valid contact phone number is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'Valid contact email address is required.' });
    }
    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'Residential address is required.' });
    }

    // Server-side file validation (magic bytes, size, base64 encoding)
    // Limits aligned with 10MB Express body limit:
    // Selfie max 2MB (decodes to ~2.67MB base64) + Mock Aadhaar max 4MB (decodes to ~5.33MB base64) = ~8.0MB total base64 payload.
    const { validateBase64File } = require('../utils/fileValidation');
    const crypto = require('crypto');

    const selfie = validateBase64File(selfie_base64, ['image/jpeg', 'image/png'], 2 * 1024 * 1024, 'Selfie photo');
    const aadhaar = validateBase64File(aadhaar_base64, ['image/jpeg', 'image/png', 'application/pdf'], 4 * 1024 * 1024, 'Aadhaar document');

    // Fetch prior KYC paths for safe replacement cleanup after commit
    const { data: priorKyc } = await supabase
      .from('candidate_kyc')
      .select('selfie_storage_path, aadhaar_storage_path')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    const selfiePath = `candidate-kyc/${candidateId}/selfie_${crypto.randomUUID()}.${selfie.ext}`;
    const aadhaarPath = `candidate-kyc/${candidateId}/aadhaar_${crypto.randomUUID()}.${aadhaar.ext}`;
    inFlightPaths.push(selfiePath, aadhaarPath);

    // Upload to private bucket applicant-documents
    const { error: selfieUpErr } = await supabase.storage
      .from('applicant-documents')
      .upload(selfiePath, selfie.buffer, { contentType: selfie.mime, upsert: false });

    if (selfieUpErr) {
      console.error('[submitKyc Selfie Upload Error]', selfieUpErr);
      const isBucketNotFound = selfieUpErr.message?.toLowerCase().includes('bucket not found') || selfieUpErr.statusCode === '404';
      return res.status(502).json({
        success: false,
        error: 'Bad Gateway',
        code: isBucketNotFound ? 'STORAGE_BUCKET_MISSING' : 'UPLOAD_FAILED',
        message: isBucketNotFound
          ? 'Storage bucket "applicant-documents" does not exist in Supabase. Please create a private bucket named "applicant-documents" in Supabase Storage.'
          : `Failed to store selfie photo: ${selfieUpErr.message}`
      });
    }

    const { error: aadhaarUpErr } = await supabase.storage
      .from('applicant-documents')
      .upload(aadhaarPath, aadhaar.buffer, { contentType: aadhaar.mime, upsert: false });

    if (aadhaarUpErr) {
      console.error('[submitKyc Aadhaar Upload Error]', aadhaarUpErr);
      const isBucketNotFound = aadhaarUpErr.message?.toLowerCase().includes('bucket not found') || aadhaarUpErr.statusCode === '404';
      return res.status(502).json({
        success: false,
        error: 'Bad Gateway',
        code: isBucketNotFound ? 'STORAGE_BUCKET_MISSING' : 'UPLOAD_FAILED',
        message: isBucketNotFound
          ? 'Storage bucket "applicant-documents" does not exist in Supabase. Please create a private bucket named "applicant-documents" in Supabase Storage.'
          : `Failed to store Aadhaar document: ${aadhaarUpErr.message}`
      });
    }

    // Upsert into candidate_kyc table (status is strictly 'submitted')
    const nowIso = new Date().toISOString();
    const { data: savedKyc, error: dbErr } = await supabase
      .from('candidate_kyc')
      .upsert({
        candidate_id: candidateId,
        legal_full_name: legal_full_name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        live_latitude: numLat,
        live_longitude: numLng,
        geo_captured_at: nowIso,
        selfie_storage_path: selfiePath,
        aadhaar_storage_path: aadhaarPath,
        consent_given: true,
        consent_timestamp: nowIso,
        status: 'submitted',
        updated_at: nowIso
      }, { onConflict: 'candidate_id' })
      .select('id, candidate_id, legal_full_name, phone, email, address, live_latitude, live_longitude, geo_captured_at, consent_timestamp, status, created_at, updated_at')
      .single();

    if (dbErr) {
      console.error('[submitKyc DB Upsert Error]', dbErr);
      throw dbErr;
    }

    // Safely remove prior files now that replacement record is committed
    if (priorKyc) {
      const obsolete = [];
      if (priorKyc.selfie_storage_path && priorKyc.selfie_storage_path !== selfiePath) {
        obsolete.push(priorKyc.selfie_storage_path);
      }
      if (priorKyc.aadhaar_storage_path && priorKyc.aadhaar_storage_path !== aadhaarPath) {
        obsolete.push(priorKyc.aadhaar_storage_path);
      }
      if (obsolete.length > 0) {
        await supabase.storage.from('applicant-documents').remove(obsolete).catch(err => {
          console.warn('[submitKyc Cleanup Warning] Failed to delete obsolete files:', err.message);
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'KYC submitted successfully.',
      kyc: savedKyc
    });
  } catch (error) {
    console.error('[submitKyc Error]', error);

    // Fail-safe cleanup: only delete in-flight paths IF DB check confirms zero references
    for (const filePath of inFlightPaths) {
      try {
        const { data: ref, error: refErr } = await supabase
          .from('candidate_kyc')
          .select('id')
          .or(`selfie_storage_path.eq.${filePath},aadhaar_storage_path.eq.${filePath}`)
          .maybeSingle();

        if (!refErr && !ref) {
          await supabase.storage.from('applicant-documents').remove([filePath]).catch(() => {});
        }
      } catch (cleanErr) {
        // Safe: never delete if database reference status is uncertain
      }
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
      message: error.message || 'Failed to submit candidate KYC.'
    });
  }
};

/**
 * Controller: Get Monthly Profile Views
 * GET /api/candidate/profile-views
 */
const getProfileViews = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    const months = parseInt(req.query.months, 10) || 6;
    const viewsData = await CandidateProfileService.getMonthlyProfileViews(userId, Math.min(Math.max(months, 1), 60));

    return res.status(200).json({
      success: true,
      data: viewsData
    });
  } catch (error) {
    console.error('[getProfileViews Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve profile views.'
    });
  }
};

/**
 * Controller: Get Candidate Saved Jobs
 * GET /api/candidate/saved-jobs
 */
const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    const savedJobs = await CandidateProfileService.getSavedJobs(userId);
    return res.status(200).json({
      success: true,
      data: savedJobs
    });
  } catch (error) {
    console.error('[getSavedJobs Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve saved jobs.'
    });
  }
};

/**
 * Controller: Save / Bookmark a Job
 * POST /api/candidate/saved-jobs/:jobId
 */
const saveJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID is required.'
      });
    }

    const result = await CandidateProfileService.saveJob(userId, jobId);
    return res.status(200).json({
      success: true,
      message: 'Job saved successfully',
      data: result
    });
  } catch (error) {
    console.error('[saveJob Error]', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: error.message || 'Failed to save job.'
    });
  }
};

/**
 * Controller: Unsave a Job
 * DELETE /api/candidate/saved-jobs/:jobId
 */
const unsaveJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID is required.'
      });
    }

    await CandidateProfileService.unsaveJob(userId, jobId);
    return res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs successfully'
    });
  } catch (error) {
    console.error('[unsaveJob Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to remove saved job.'
    });
  }
};

/**
 * Controller: Get Candidate Packages
 * GET /api/candidate/packages
 * Returns real purchased or subscribed packages for the candidate.
 * If candidate packages table/records do not exist, returns empty array without inventing mock data.
 */
const getCandidatePackages = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    const packages = await CandidateProfileService.getCandidatePackages(userId);
    return res.status(200).json({
      success: true,
      packages: packages || []
    });
  } catch (error) {
    console.error('[getCandidatePackages Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve candidate packages.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteProfile,
  getKycStatus,
  submitKyc,
  getProfileViews,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getCandidatePackages
};




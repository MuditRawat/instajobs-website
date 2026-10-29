const supabase = require('../config/supabase');
const CandidateProfileService = require('./candidateProfileService');
const crypto = require('crypto');

class CandidateResumeService {
  /**
   * Resolve and verify candidate profile ID from authenticated user ID
   * @param {string} userId
   * @returns {Promise<object>} Candidate profile record
   */
  static async getVerifiedCandidateProfile(userId) {
    if (!userId) {
      const err = new Error('User identity is required.');
      err.statusCode = 401;
      throw err;
    }

    const profile = await CandidateProfileService.getCandidateProfile(userId);
    if (!profile || !profile.id) {
      const err = new Error('Candidate profile not found.');
      err.statusCode = 404;
      err.code = 'CANDIDATE_PROFILE_NOT_FOUND';
      throw err;
    }

    return profile;
  }

  /**
   * List all reusable CVs owned by the authenticated candidate
   * @param {string} userId
   * @returns {Promise<Array<object>>}
   */
  static async listCandidateCvs(userId) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const candidate = await this.getVerifiedCandidateProfile(userId);

    const { data: cvs, error } = await supabase
      .from('candidate_resumes')
      .select('id, candidate_id, file_name, storage_path, file_size_bytes, mime_type, is_default, created_at, updated_at')
      .eq('candidate_id', candidate.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        const err = new Error('Database migration 006_candidate_resumes.sql is pending execution in Supabase.');
        err.statusCode = 503;
        err.code = 'DATABASE_MIGRATION_REQUIRED';
        throw err;
      }
      throw new Error(`Database error fetching CV list: ${error.message}`);
    }

    return cvs || [];
  }

  /**
   * Upload and save a new reusable CV in candidate library
   * @param {string} userId
   * @param {{ buffer: Buffer, filename: string, mimeType: string, size: number }} fileData
   * @returns {Promise<object>} Created CV record
   */
  static async uploadCandidateCv(userId, fileData) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const candidate = await this.getVerifiedCandidateProfile(userId);

    const candidateId = candidate.id;
    const cleanFileName = (fileData.filename || 'resume.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');

    const ext = cleanFileName.split('.').pop()?.toLowerCase() || 'pdf';
    const uniqueFileName = `cv_${crypto.randomUUID()}_${cleanFileName}`;
    const storagePath = `reusable-cvs/${candidateId}/${uniqueFileName}`;

    // 1. Stage upload to private applicant-documents bucket
    const { error: uploadErr } = await supabase.storage
      .from('applicant-documents')
      .upload(storagePath, fileData.buffer, {
        contentType: fileData.mimeType,
        upsert: false
      });

    if (uploadErr) {
      const isBucketNotFound = uploadErr.message?.toLowerCase().includes('bucket not found') || uploadErr.statusCode === '404';
      const err = new Error(
        isBucketNotFound
          ? 'Storage bucket "applicant-documents" does not exist in Supabase Storage.'
          : `Failed to upload CV file: ${uploadErr.message}`
      );
      err.statusCode = 502;
      throw err;
    }

    // 2. Determine default status (if candidate has 0 CVs, make this the default)
    try {
      const { count, error: countErr } = await supabase
        .from('candidate_resumes')
        .select('id', { count: 'exact', head: true })
        .eq('candidate_id', candidateId);

      if (countErr) {
        if (countErr.code === 'PGRST205' || countErr.message?.includes('schema cache')) {
          const err = new Error('Database migration 006_candidate_resumes.sql is pending execution in Supabase.');
          err.statusCode = 503;
          err.code = 'DATABASE_MIGRATION_REQUIRED';
          throw err;
        }
        throw countErr;
      }

      const shouldBeDefault = (count === 0 || count === null);

      if (shouldBeDefault) {
        // Clear any existing default just in case of prior edge cases
        await supabase
          .from('candidate_resumes')
          .update({ is_default: false, updated_at: new Date().toISOString() })
          .eq('candidate_id', candidateId)
          .eq('is_default', true);
      }

      const newRecord = {
        candidate_id: candidateId,
        file_name: cleanFileName,
        storage_path: storagePath,
        file_size_bytes: fileData.size || fileData.buffer.length,
        mime_type: fileData.mimeType,
        is_default: shouldBeDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('candidate_resumes')
        .insert([newRecord])
        .select('*')
        .single();

      if (insertErr) {
        throw insertErr;
      }

      return inserted;
    } catch (dbErr) {
      // Rollback: purge staged file from storage if DB operation fails
      await supabase.storage.from('applicant-documents').remove([storagePath]).catch((cleanupErr) => {
        console.warn(`[CV Upload Rollback Warning] Failed to delete staged file ${storagePath}:`, cleanupErr.message);
      });

      if (dbErr.statusCode) throw dbErr;
      throw new Error(`Failed to save CV record: ${dbErr.message}`);
    }
  }

  /**
   * Set a specific CV as the default resume
   * @param {string} userId
   * @param {string} cvId
   * @returns {Promise<object>} Updated default CV record
   */
  static async setDefaultCv(userId, cvId) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const candidate = await this.getVerifiedCandidateProfile(userId);
    const candidateId = candidate.id;

    // 1. Verify CV exists and belongs to candidate
    const { data: targetCv, error: fetchErr } = await supabase
      .from('candidate_resumes')
      .select('*')
      .eq('id', cvId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (fetchErr) throw new Error(`Database error verifying CV: ${fetchErr.message}`);
    if (!targetCv) {
      const err = new Error('CV record not found or does not belong to you.');
      err.statusCode = 404;
      throw err;
    }

    if (targetCv.is_default) {
      return targetCv; // Already default
    }

    // 2. Sequential update: Clear current default, then set new default
    const now = new Date().toISOString();
    const { error: clearErr } = await supabase
      .from('candidate_resumes')
      .update({ is_default: false, updated_at: now })
      .eq('candidate_id', candidateId)
      .eq('is_default', true);

    if (clearErr) throw new Error(`Failed to reset previous default CV: ${clearErr.message}`);

    const { data: updated, error: setErr } = await supabase
      .from('candidate_resumes')
      .update({ is_default: true, updated_at: now })
      .eq('id', cvId)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();

    if (setErr) throw new Error(`Failed to set target CV as default: ${setErr.message}`);
    return updated;
  }

  /**
   * Replace the underlying file of an existing CV record
   * @param {string} userId
   * @param {string} cvId
   * @param {{ buffer: Buffer, filename: string, mimeType: string, size: number }} fileData
   * @returns {Promise<object>} Updated CV record
   */
  static async replaceCandidateCv(userId, cvId, fileData) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const candidate = await this.getVerifiedCandidateProfile(userId);
    const candidateId = candidate.id;

    // 1. Verify existing CV record
    const { data: oldCv, error: fetchErr } = await supabase
      .from('candidate_resumes')
      .select('*')
      .eq('id', cvId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (fetchErr) throw new Error(`Database error verifying CV: ${fetchErr.message}`);
    if (!oldCv) {
      const err = new Error('CV record not found or does not belong to you.');
      err.statusCode = 404;
      throw err;
    }

    const cleanFileName = (fileData.filename || oldCv.file_name)
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');

    const newStoragePath = `reusable-cvs/${candidateId}/cv_${crypto.randomUUID()}_${cleanFileName}`;

    // 2. Stage new file upload
    const { error: uploadErr } = await supabase.storage
      .from('applicant-documents')
      .upload(newStoragePath, fileData.buffer, {
        contentType: fileData.mimeType,
        upsert: false
      });

    if (uploadErr) {
      const err = new Error(`Failed to upload replacement CV file: ${uploadErr.message}`);
      err.statusCode = 502;
      throw err;
    }

    // 3. Update database record with new path and metadata
    const now = new Date().toISOString();
    try {
      const { data: updated, error: updateErr } = await supabase
        .from('candidate_resumes')
        .update({
          file_name: cleanFileName,
          storage_path: newStoragePath,
          file_size_bytes: fileData.size || fileData.buffer.length,
          mime_type: fileData.mimeType,
          updated_at: now
        })
        .eq('id', cvId)
        .eq('candidate_id', candidateId)
        .select('*')
        .single();

      if (updateErr) throw updateErr;

      // 4. Safely clean up old storage file if unreferenced
      const oldPath = oldCv.storage_path;
      if (oldPath && oldPath !== newStoragePath) {
        this.safeRemoveStorageObject(oldPath).catch((err) => {
          console.warn(`[CV Replacement Cleanup Warning] Failed to delete old file ${oldPath}:`, err.message);
        });
      }

      return updated;
    } catch (dbErr) {
      // Rollback: purge staged new file from storage
      await supabase.storage.from('applicant-documents').remove([newStoragePath]).catch(() => {});
      throw new Error(`Failed to update CV record during replacement: ${dbErr.message}`);
    }
  }

  /**
   * Delete a candidate CV and auto-promote remaining CV if deleted CV was default
   * @param {string} userId
   * @param {string} cvId
   * @returns {Promise<{ success: boolean, deletedId: string, promotedCvId: string|null }>}
   */
  static async deleteCandidateCv(userId, cvId) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const candidate = await this.getVerifiedCandidateProfile(userId);
    const candidateId = candidate.id;

    // 1. Verify CV exists
    const { data: targetCv, error: fetchErr } = await supabase
      .from('candidate_resumes')
      .select('*')
      .eq('id', cvId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (fetchErr) throw new Error(`Database error verifying CV: ${fetchErr.message}`);
    if (!targetCv) {
      const err = new Error('CV record not found or does not belong to you.');
      err.statusCode = 404;
      throw err;
    }

    const wasDefault = targetCv.is_default;
    const storagePathToDelete = targetCv.storage_path;

    // 2. Delete database record
    const { error: delErr } = await supabase
      .from('candidate_resumes')
      .delete()
      .eq('id', cvId)
      .eq('candidate_id', candidateId);

    if (delErr) throw new Error(`Database error deleting CV record: ${delErr.message}`);

    // 3. Auto-promote fallback default if the deleted CV was default
    let promotedCvId = null;
    if (wasDefault) {
      const { data: remaining, error: remErr } = await supabase
        .from('candidate_resumes')
        .select('id')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!remErr && remaining && remaining.length > 0) {
        promotedCvId = remaining[0].id;
        await supabase
          .from('candidate_resumes')
          .update({ is_default: true, updated_at: new Date().toISOString() })
          .eq('id', promotedCvId);
      }
    }

    // 4. Safely clean up storage file
    if (storagePathToDelete) {
      this.safeRemoveStorageObject(storagePathToDelete).catch((err) => {
        console.warn(`[CV Deletion Cleanup Warning] Failed to delete storage file ${storagePathToDelete}:`, err.message);
      });
    }

    return {
      success: true,
      deletedId: cvId,
      promotedCvId
    };
  }

  /**
   * Generate an authorized short-lived signed URL for candidate CV download/viewing
   * @param {string} userId
   * @param {string} cvId
   * @param {number} expiresInSeconds
   * @returns {Promise<{ signedUrl: string, fileName: string, expiresIn: number }>}
   */
  static async getCvSignedUrl(userId, cvId, expiresInSeconds = 3600) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const candidate = await this.getVerifiedCandidateProfile(userId);
    const candidateId = candidate.id;

    // Verify ownership
    const { data: cv, error: fetchErr } = await supabase
      .from('candidate_resumes')
      .select('*')
      .eq('id', cvId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (fetchErr) throw new Error(`Database error verifying CV: ${fetchErr.message}`);
    if (!cv) {
      const err = new Error('CV record not found or does not belong to you.');
      err.statusCode = 404;
      throw err;
    }

    const { data: signedData, error: signErr } = await supabase.storage
      .from('applicant-documents')
      .createSignedUrl(cv.storage_path, expiresInSeconds);

    if (signErr || !signedData?.signedUrl) {
      const isBucketNotFound = signErr?.message?.toLowerCase().includes('bucket not found');
      const err = new Error(
        isBucketNotFound
          ? 'Storage bucket "applicant-documents" does not exist in Supabase Storage.'
          : `Failed to generate secure download link: ${signErr?.message || 'Unknown error'}`
      );
      err.statusCode = 502;
      throw err;
    }

    return {
      signedUrl: signedData.signedUrl,
      fileName: cv.file_name,
      expiresIn: expiresInSeconds
    };
  }

  /**
   * Helper: Remove a storage object only if NOT referenced by any job application
   * @param {string} storagePath
   */
  static async safeRemoveStorageObject(storagePath) {
    if (!supabase || !storagePath) return;

    try {
      // Check if any job application references this file path
      const { data: ref } = await supabase
        .from('job_applications')
        .select('id')
        .eq('application_cv_path', storagePath)
        .maybeSingle();

      if (ref) {
        console.warn(`[Safe Storage Check] Skipping storage removal: path ${storagePath} is referenced by application ${ref.id}`);
        return;
      }

      await supabase.storage.from('applicant-documents').remove([storagePath]);
    } catch (err) {
      console.warn(`[Safe Storage Check Error] Failed to remove ${storagePath}:`, err.message);
    }
  }
}

module.exports = CandidateResumeService;


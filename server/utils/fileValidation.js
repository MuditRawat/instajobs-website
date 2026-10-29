/**
 * File Validation Utility
 * Enforces strict base64 decoding, file-size limits, and magic-byte inspections.
 */

const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * Validates a base64 encoded file input against size and file signature rules.
 *
 * @param {string} base64Input - Base64 string (optional data URL prefix allowed).
 * @param {string[]} allowedTypes - Array of permitted MIME types.
 * @param {number} maxBytes - Maximum allowed decoded byte length.
 * @param {string} fieldName - Descriptive name for errors.
 * @returns {{ buffer: Buffer, mime: string, ext: string }}
 */
function validateBase64File(base64Input, allowedTypes, maxBytes, fieldName = 'file') {
  if (!base64Input || typeof base64Input !== 'string') {
    const err = new Error(`${fieldName} payload is required and must be a valid base64 string.`);
    err.statusCode = 400;
    throw err;
  }

  // Strip data URL scheme prefix if present (e.g., "data:application/pdf;base64,")
  const cleanBase64 = base64Input.replace(/^data:[^;]+;base64,/, '').trim();

  if (!cleanBase64 || !BASE64_REGEX.test(cleanBase64)) {
    const err = new Error(`${fieldName} contains invalid base64 encoding.`);
    err.statusCode = 400;
    throw err;
  }

  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length === 0) {
    const err = new Error(`${fieldName} cannot be empty.`);
    err.statusCode = 400;
    throw err;
  }

  if (buffer.length > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
    const err = new Error(`${fieldName} exceeds maximum permitted size of ${maxMb}MB.`);
    err.statusCode = 400;
    throw err;
  }

  let detectedMime = null;
  let ext = 'bin';

  // 1. JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    detectedMime = 'image/jpeg';
    ext = 'jpg';
  }
  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  else if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    detectedMime = 'image/png';
    ext = 'png';
  }
  // 3. PDF: %PDF-
  else if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    detectedMime = 'application/pdf';
    ext = 'pdf';
  }
  // 4. DOCX: Strict Open Packaging Conventions (OPC) ZIP package validation
  else if (
    buffer.length >= 30 &&
    buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04
  ) {
    if (isValidDocxPackage(buffer)) {
      detectedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      ext = 'docx';
    }
  }

  if (!detectedMime || !allowedTypes.includes(detectedMime)) {
    const readableAllowed = allowedTypes
      .map(t => t.replace('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'DOCX').replace('application/', '').replace('image/', '').toUpperCase())
      .join(', ');
    const err = new Error(`${fieldName} format is not supported. Allowed formats: ${readableAllowed}.`);
    err.statusCode = 400;
    throw err;
  }

  return { buffer, mime: detectedMime, ext };
}

/**
 * Validates actual DOCX structure per ISO/IEC 29500 / ECMA-376 Open Packaging Conventions.
 * Parses ZIP Local File Headers and Central Directory without external dependencies.
 *
 * @param {Buffer} buffer - Buffer of the file
 * @returns {boolean} True if the buffer contains valid DOCX package structure
 */
function isValidDocxPackage(buffer) {
  try {
    const filenames = new Set();
    let offset = 0;

    // Scan ZIP Local File Headers (Magic: 0x04034b50 / "PK\x03\x04")
    while (offset + 30 <= buffer.length) {
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);
        const headerEnd = offset + 30;

        if (headerEnd + fileNameLength <= buffer.length) {
          const fileName = buffer.toString('utf-8', headerEnd, headerEnd + fileNameLength);
          filenames.add(fileName);
        }

        // Advance to next record: 30 + fileNameLength + extraFieldLength + compressedSize
        const step = 30 + fileNameLength + extraFieldLength + compressedSize;
        if (step <= 30) {
          offset += 4;
        } else {
          offset += step;
        }
      } else {
        // Not a local header, advance to next byte to scan
        offset++;
      }
    }

    // Also scan ZIP Central Directory (Magic: 0x02014b50 / "PK\x01\x02") for complete file list
    let cdOffset = 0;
    while (cdOffset + 46 <= buffer.length) {
      if (
        buffer[cdOffset] === 0x50 &&
        buffer[cdOffset + 1] === 0x4b &&
        buffer[cdOffset + 2] === 0x01 &&
        buffer[cdOffset + 3] === 0x02
      ) {
        const cdFileNameLength = buffer.readUInt16LE(cdOffset + 28);
        const cdExtraLength = buffer.readUInt16LE(cdOffset + 30);
        const cdCommentLength = buffer.readUInt16LE(cdOffset + 32);
        const cdHeaderEnd = cdOffset + 46;

        if (cdHeaderEnd + cdFileNameLength <= buffer.length) {
          const cdFileName = buffer.toString('utf-8', cdHeaderEnd, cdHeaderEnd + cdFileNameLength);
          filenames.add(cdFileName);
        }

        cdOffset += 46 + cdFileNameLength + cdExtraLength + cdCommentLength;
      } else {
        cdOffset++;
      }
    }

    // A valid DOCX package MUST contain:
    // 1. [Content_Types].xml (root OPC MIME dictionary)
    // 2. Either 'word/document.xml' (main document body) or files inside the 'word/' directory
    const hasContentTypes = filenames.has('[Content_Types].xml');
    const hasWordDirectory = Array.from(filenames).some(fn => fn.startsWith('word/'));

    return hasContentTypes && hasWordDirectory;
  } catch (e) {
    return false;
  }
}

module.exports = { validateBase64File, isValidDocxPackage };

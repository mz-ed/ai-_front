/**
 * apiService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * All network calls live here so the React component stays clean.
 *
 * Flow for each selected model:
 *   1. POST file  →  FastAPI  (AI inference)
 *   2. Await AI response
 *   3. POST file + metadata as multipart/form-data  →  NestJS /upload/single
 *      (identical to the curl below — no JSON, no blobs, just a real file upload)
 *
 *   curl -X POST http://localhost:3000/upload/single \
 *     -F "file=@/home/kali/Desktop/scan.pdf" \
 *     -F "patientId=pat_123" \
 *     -F "doctorId=doc_456" \
 *     -F "fileType=scan" \
 *     -F "modelName=Breast Cancer AI" \
 *     -F "prediction={...}"
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * CONFIGURATION — the only section you need to edit regularly
 */

const AI_API_BASE = "http://localhost:8000/api/v1"; // FastAPI base URL
const UPLOAD_BASE = "http://localhost:3000";   // NestJS base URL
const UPLOAD_PATH = "/upload/single";          // NestJS endpoint path
let FILEID = "";



/**
 * Static fields sent on every upload alongside the file.
 * Override any of these per-call via the `uploadMeta` option in runAnalysis().
 *
 * These map 1-to-1 to the -F flags in curl.
 * Add / remove keys here to match your NestJS DTO.
 */
const DEFAULT_UPLOAD_FIELDS = {
  patientId : "pat_123",   // ← swap for real value from your app state
  fileType  : "1D",      // e.g. "prescription" | "report" | "scan"
};

// ── uploadToStorage ───────────────────────────────────────────────────────────

/**
 * Send the original file to NestJS as a proper multipart/form-data request.
 * The file is forwarded exactly as it was uploaded by the user — no conversion.
 *
 * Extra fields (modelName, prediction, etc.) are appended as regular form fields.
 * Objects are JSON.stringify'd so the server receives them as strings it can parse.
 *
 * @param {Blob}   blob        - Original File/Blob from IndexedDB
 * @param {string} fileName    - Original filename (preserved in the multipart part)
 * @param {object} extraFields - Additional -F fields merged over DEFAULT_UPLOAD_FIELDS
 * @returns {Promise<string|null>} _id / id from the server response
 */
async function uploadToStorage(blob, fileName, extraFields = {}) {
  const form = new FormData();

  // file field — equivalent to  -F "file=@/path/to/file"
  // Passing fileName as the 3rd argument keeps the original name on the server side.
  form.append("file", blob, fileName);

  // Merge static defaults with any per-call overrides
  const fields = { ...DEFAULT_UPLOAD_FIELDS, ...extraFields };

  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue; // skip empties
    // Objects / arrays (e.g. the AI prediction) become JSON strings
    form.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  }

  // ⚠️ Do NOT set Content-Type manually.
  // The browser sets it automatically with the correct multipart boundary.
  const response = await fetch(`${UPLOAD_BASE}${UPLOAD_PATH}`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data._id ?? data.id ?? null;
}

// ── analyzeFileWithModel ──────────────────────────────────────────────────────

/**
 * Run AI inference on one file + one model, then upload the file + result to NestJS.
 *
 * @param {Blob}   blob      - Raw file blob
 * @param {string} fileName  - Original filename
 * @param {object} model     - { name, endpoint, desc, accuracy }
 * @param {object} [meta]    - Extra form fields to merge (e.g. patientId override)
 * @returns {Promise<AnalysisResult>}
 */
async function analyzeFileWithModel(blob, fileName, model, meta = {}) {
  const result = {
    modelName  : model.name,
    endpoint   : model.endpoint,
    fileName,
    prediction : null,
    mongoId    : null,
    savedAt    : new Date().toISOString(),
    error      : null,
  };

  // ── Step 1: AI inference ──────────────────────────────────────────────────
  try {
    const aiForm = new FormData();
    aiForm.append("file", blob, fileName);

    const aiResponse = await fetch(`${AI_API_BASE}${model.endpoint}`, {
      method: "POST",
      body: aiForm,
    });

    if (!aiResponse.ok) {
      throw new Error(`AI endpoint returned ${aiResponse.status}: ${aiResponse.statusText}`);
    }

    result.prediction = await aiResponse.json();
  } catch (aiError) {
    result.error = aiError.message;
    console.error(`[apiService] AI call failed for "${model.name}":`, aiError);
    // Do not upload to NestJS if AI failed
    return result;
  }

  // ── Step 2: Upload file + AI result to NestJS (only on AI success) ────────
  try {
    const uploadFields = {
      ...meta,                           // caller overrides (patientId, etc.)
      modelName    : model.name,
      modelAccuracy: model.accuracy,
      analyzedAt   : result.savedAt,
      prediction   : result.prediction, // will be JSON.stringify'd automatically
    };

    result.mongoId = await uploadToStorage(blob, fileName, uploadFields);
    console.info(`[apiService] Uploaded to NestJS. _id=${result.mongoId}`);
  } catch (uploadError) {
    // Log but don't fail — the AI result is still valid even if storage fails
    console.warn(`[apiService] NestJS upload failed for "${model.name}":`, uploadError);
  }

  return result;
}

// ── runAnalysis (public) ──────────────────────────────────────────────────────

/**
 * Run analysis for all selected models against uploaded files.
 *
 * @param {StoredFile[]} storedFiles          - From fileStorage.js (each has .blob, .name)
 * @param {number[]}     selectedModelIndices - Indices into the models array
 * @param {object[]}     models               - Full model config from the component
 * @param {object}       [options]
 * @param {boolean}      [options.allFilesAllModels=false]
 *   false → send storedFiles[0] to every model (default)
 *   true  → send every file × every model (cross-product)
 * @param {object}       [options.uploadMeta={}]
 *   Extra form fields forwarded to uploadToStorage on every call.
 *   Use this to pass the real patientId / doctorId from your app state:
 *     runAnalysis(files, models, MODELS, { uploadMeta: { patientId: "pat_999" } })
 * @param {function}     [options.onProgress]
 *   Called after each job: onProgress(result, doneCount, totalCount)
 *
 * @returns {Promise<AnalysisResult[]>}
 */
export async function runAnalysis(
  storedFiles,
  selectedModelIndices,
  models,
  options = {}
) {
  const { allFilesAllModels = false, uploadMeta = {}, onProgress } = options;

  if (!storedFiles?.length)          throw new Error("No files provided for analysis.");
  if (!selectedModelIndices?.length) throw new Error("No models selected.");

  // Build job list
  const jobs = [];

  if (allFilesAllModels) {
    for (const sf of storedFiles)
      for (const idx of selectedModelIndices)
        jobs.push({ storedFile: sf, model: models[idx] });
  } else {
    // Default: first file only
    for (const idx of selectedModelIndices)
      jobs.push({ storedFile: storedFiles[0], model: models[idx] });
  }

  const total = jobs.length;
  let done = 0;
  const results = [];

  // Parallel execution. Switch to sequential (for-of + await) if your server
  // struggles with concurrent multipart uploads.
  await Promise.all(
    jobs.map(async ({ storedFile, model }) => {
      const blob     = storedFile.blob ?? storedFile;
      const fileName = storedFile.name ?? blob.name ?? "unknown";

      const result = await analyzeFileWithModel(blob, fileName, model, uploadMeta);
      results.push(result);
      done++;
      onProgress?.(result, done, total);
    })
  );

  return results;
}


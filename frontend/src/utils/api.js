// API utility for backend communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Create a new audio session
 * @returns {Promise<{session_id: string}>}
 */
export async function createSession() {
  const response = await fetch(`${API_BASE_URL}/api/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Start calibration for a session
 * @param {string} sessionId
 * @returns {Promise<{status: string}>}
 */
export async function startCalibration(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/calibration/${sessionId}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to start calibration: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Finish calibration for a session
 * @param {string} sessionId
 * @returns {Promise<{baseline: number, duration: number, text: string}>}
 */
export async function finishCalibration(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/calibration/${sessionId}/finish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to finish calibration: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get calibration status for a session
 * @param {string} sessionId
 * @returns {Promise<{calibration_baseline: number|null, calibration_duration: number|null, warning_active: boolean}>}
 */
export async function getCalibrationStatus(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/calibration/${sessionId}/status`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get calibration status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Dismiss warning for a session
 * @param {string} sessionId
 * @returns {Promise<{status: string}>}
 */
export async function dismissWarning(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/calibration/${sessionId}/dismiss-warning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to dismiss warning: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send audio chunk to backend for processing
 * @param {string} sessionId
 * @param {Blob} audioBlob
 * @returns {Promise<{warning: boolean, transcript: object|null}>}
 */
export async function sendAudioChunk(sessionId, audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.wav');

  const response = await fetch(`${API_BASE_URL}/api/audio-chunk/${sessionId}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to send audio chunk: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Start listening (for monitoring mode)
 * @param {string} sessionId
 * @returns {Promise<{status: string}>}
 */
export async function startListening(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/start-listening/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to start listening: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Stop listening (for monitoring mode)
 * @param {string} sessionId
 * @returns {Promise<{status: string}>}
 */
export async function stopListening(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/stop-listening/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to stop listening: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get session status
 * @param {string} sessionId
 * @returns {Promise<{state: string, transcripts: array}>}
 */
export async function getSessionStatus(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/status`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get session status: ${response.statusText}`);
  }

  return response.json();
}

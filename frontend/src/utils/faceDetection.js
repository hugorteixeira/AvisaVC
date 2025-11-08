/**
 * Face Detection Utility using MediaPipe
 * Detects facial asymmetry that may indicate stroke
 */

// Landmark indices
const LANDMARKS = {
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  EYE_LEFT_OUTER: 33,
  EYE_RIGHT_OUTER: 263,
};

// Detection parameters
const BASELINE_FRAMES = 60; // Frames to collect for baseline
const RECENT_FRAMES = 10; // Recent frames to compare
const PERSIST_FRAMES = 8; // Frames to persist before alerting

export class FaceDetector {
  constructor() {
    this.faceLandmarker = null;
    this.baseline = [];
    this.recent = [];
    this.persist = 0;
    this.isAlerted = false;
    this.isCalibrated = false;
  }

  /**
   * Initialize MediaPipe Face Landmarker
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Load MediaPipe vision tasks
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3');
      const { FaceLandmarker, FilesetResolver } = vision;

      // Initialize fileset
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      // Create Face Landmarker
      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    } catch (error) {
      console.error('Failed to initialize FaceLandmarker:', error);
      throw new Error('Não foi possível inicializar o detector facial. Verifique sua conexão.');
    }
  }

  /**
   * Process a video frame and detect facial asymmetry
   * @param {HTMLVideoElement} video - Video element
   * @param {number} timestamp - Performance timestamp
   * @returns {Object} Detection result
   */
  detectFrame(video, timestamp) {
    if (!this.faceLandmarker) {
      throw new Error('Face landmarker not initialized');
    }

    // Validate video dimensions before processing
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return {
        faceDetected: false,
        status: 'no_video',
        message: 'Vídeo não pronto',
      };
    }

    const result = this.faceLandmarker.detectForVideo(video, timestamp);

    // No face detected
    if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
      return {
        faceDetected: false,
        status: 'no_face',
        message: 'Nenhum rosto detectado',
      };
    }

    const landmarks = result.faceLandmarks[0];

    // Get key landmarks
    const eyeLeft = landmarks[LANDMARKS.EYE_LEFT_OUTER];
    const eyeRight = landmarks[LANDMARKS.EYE_RIGHT_OUTER];
    const mouthLeft = landmarks[LANDMARKS.MOUTH_LEFT];
    const mouthRight = landmarks[LANDMARKS.MOUTH_RIGHT];

    // Calculate asymmetry score
    const skewScore = this.calculateAsymmetry(eyeLeft, eyeRight, mouthLeft, mouthRight);

    // Update baseline or recent
    if (!this.isCalibrated) {
      this.baseline.push(skewScore);
      if (this.baseline.length > BASELINE_FRAMES) {
        this.baseline.shift();
      }

      if (this.baseline.length === BASELINE_FRAMES) {
        this.isCalibrated = true;
      }

      return {
        faceDetected: true,
        status: 'calibrating',
        message: `Calibrando... ${this.baseline.length}/${BASELINE_FRAMES}`,
        progress: (this.baseline.length / BASELINE_FRAMES) * 100,
        skewScore,
        landmarks: { eyeLeft, eyeRight, mouthLeft, mouthRight },
      };
    }

    // Update recent frames
    this.recent.push(skewScore);
    if (this.recent.length > RECENT_FRAMES) {
      this.recent.shift();
    }

    // Calculate statistics
    const baselineMean = this.mean(this.baseline);
    const baselineStd = this.std(this.baseline, baselineMean);
    const recentMean = this.mean(this.recent);
    const delta = Math.abs(recentMean - baselineMean);
    const threshold = Math.max(0.07, 3 * baselineStd);

    // Update persistence
    if (this.recent.length === RECENT_FRAMES && delta > threshold) {
      this.persist += 1;
    } else {
      this.persist = Math.max(0, this.persist - 1);
    }

    // Check for alert
    if (this.persist >= PERSIST_FRAMES) {
      this.isAlerted = true;
    }

    // Adaptive baseline update (only if not alerted and stable)
    if (!this.isAlerted && this.recent.length === RECENT_FRAMES && delta < threshold / 2) {
      this.baseline.push(recentMean);
      if (this.baseline.length > BASELINE_FRAMES) {
        this.baseline.shift();
      }
    }

    return {
      faceDetected: true,
      status: this.isAlerted ? 'alert' : 'ok',
      message: this.isAlerted ? 'ASSIMETRIA DETECTADA!' : 'Normal',
      skewScore: recentMean,
      baseline: baselineMean,
      delta,
      threshold,
      persist: this.persist,
      landmarks: { eyeLeft, eyeRight, mouthLeft, mouthRight },
    };
  }

  /**
   * Calculate facial asymmetry score
   * @param {Object} eyeL - Left eye landmark
   * @param {Object} eyeR - Right eye landmark
   * @param {Object} mouthL - Left mouth corner landmark
   * @param {Object} mouthR - Right mouth corner landmark
   * @returns {number} Asymmetry score
   */
  calculateAsymmetry(eyeL, eyeR, mouthL, mouthR) {
    // Vector from right eye to left eye
    const eyeVec = {
      x: eyeL.x - eyeR.x,
      y: eyeL.y - eyeR.y,
    };
    const eyeAngle = Math.atan2(eyeVec.y, eyeVec.x);
    const eyeDist = Math.hypot(eyeVec.x, eyeVec.y) || 1;

    // Mouth vector
    const mouthVec = {
      x: mouthR.x - mouthL.x,
      y: mouthR.y - mouthL.y,
    };

    // Rotate mouth vector to align with eye axis
    const cos = Math.cos(-eyeAngle);
    const sin = Math.sin(-eyeAngle);
    const mouthVyAligned = mouthVec.x * sin + mouthVec.y * cos;

    // Normalized skew score
    return mouthVyAligned / eyeDist;
  }

  /**
   * Get baseline data for saving
   * @returns {Object} Baseline data
   */
  getBaselineData() {
    if (!this.isCalibrated) {
      throw new Error('Calibration not complete');
    }

    return {
      baseline: [...this.baseline],
      mean: this.mean(this.baseline),
      std: this.std(this.baseline, this.mean(this.baseline)),
      frames: BASELINE_FRAMES,
      timestamp: Date.now(),
    };
  }

  /**
   * Load baseline data
   * @param {Object} data - Baseline data
   */
  loadBaseline(data) {
    this.baseline = [...data.baseline];
    this.isCalibrated = true;
    this.recent = [];
    this.persist = 0;
    this.isAlerted = false;
  }

  /**
   * Reset detection state
   */
  reset() {
    this.baseline = [];
    this.recent = [];
    this.persist = 0;
    this.isAlerted = false;
    this.isCalibrated = false;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.faceLandmarker) {
      this.faceLandmarker.close();
      this.faceLandmarker = null;
    }
  }

  /**
   * Calculate mean of array
   * @param {number[]} arr
   * @returns {number}
   */
  mean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Calculate standard deviation
   * @param {number[]} arr
   * @param {number} mean
   * @returns {number}
   */
  std(arr, mean) {
    if (arr.length === 0) return 0;
    const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  }
}

/**
 * Draw facial landmarks on canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} landmarks
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {boolean} isAlert
 */
export function drawLandmarks(ctx, landmarks, canvasWidth, canvasHeight, isAlert = false) {
  const { eyeLeft, eyeRight, mouthLeft, mouthRight } = landmarks;

  // Convert normalized coordinates to pixel coordinates
  const toPx = (point) => ({
    x: point.x * canvasWidth,
    y: point.y * canvasHeight,
  });

  const eyeL = toPx(eyeLeft);
  const eyeR = toPx(eyeRight);
  const mouthL = toPx(mouthLeft);
  const mouthR = toPx(mouthRight);

  // Draw eye line (reference)
  ctx.strokeStyle = 'rgba(160, 160, 160, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(eyeL.x, eyeL.y);
  ctx.lineTo(eyeR.x, eyeR.y);
  ctx.stroke();

  // Draw mouth line (indicator)
  ctx.strokeStyle = isAlert ? 'rgba(255, 70, 70, 0.9)' : 'rgba(60, 220, 120, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mouthL.x, mouthL.y);
  ctx.lineTo(mouthR.x, mouthR.y);
  ctx.stroke();
}

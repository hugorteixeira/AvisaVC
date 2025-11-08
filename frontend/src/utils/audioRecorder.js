/**
 * Audio Recorder Utility
 * Handles microphone access, recording, and audio chunk processing
 */

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.stream = null;
    this.chunks = [];
    this.isRecording = false;
  }

  /**
   * Initialize and request microphone access
   * @returns {Promise<MediaStream>}
   */
  async init() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      return this.stream;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      throw new Error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  }

  /**
   * Start recording
   * @param {Function} onDataAvailable - Callback when audio chunk is ready
   * @param {number} timeSlice - Time between chunks in milliseconds (default: 1000ms)
   */
  startRecording(onDataAvailable, timeSlice = 1000) {
    if (!this.stream) {
      throw new Error('Microphone not initialized. Call init() first.');
    }

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
        if (onDataAvailable) {
          onDataAvailable(event.data);
        }
      }
    };

    this.mediaRecorder.start(timeSlice);
    this.isRecording = true;
  }

  /**
   * Stop recording and return the complete audio blob
   * @returns {Promise<Blob>}
   */
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm;codecs=opus' });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get audio level for visualization
   * @returns {Promise<number>} Volume level (0-100)
   */
  async getAudioLevel() {
    if (!this.stream) {
      return 0;
    }

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const source = this.audioContext.createMediaStreamSource(this.stream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return Math.min(100, (average / 128) * 100);
  }

  /**
   * Start continuous audio level monitoring
   * @param {Function} callback - Called with audio level (0-100)
   * @param {number} interval - Update interval in milliseconds
   * @returns {number} Interval ID for clearing
   */
  startAudioLevelMonitoring(callback, interval = 100) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const source = this.audioContext.createMediaStreamSource(this.stream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const intervalId = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const level = Math.min(100, (average / 128) * 100);
      callback(level);
    }, interval);

    return intervalId;
  }

  /**
   * Convert audio blob to WAV format
   * @param {Blob} blob - Input audio blob
   * @returns {Promise<Blob>} WAV formatted blob
   */
  async convertToWav(blob) {
    // For simplicity, we'll send the webm directly to backend
    // The backend can handle webm format
    // If you need true WAV conversion, you'd need to decode and re-encode
    return blob;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.mediaRecorder = null;
    this.audioContext = null;
    this.stream = null;
    this.chunks = [];
    this.isRecording = false;
  }
}

/**
 * Simple audio level visualization
 * @param {number} level - Audio level (0-100)
 * @returns {string} Visual representation
 */
export function visualizeAudioLevel(level) {
  const bars = Math.floor(level / 10);
  return '█'.repeat(bars) + '░'.repeat(10 - bars);
}

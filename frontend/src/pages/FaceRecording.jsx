import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { FaceDetector, drawLandmarks } from '../utils/faceDetection';

export default function FaceRecording() {
  const navigate = useNavigate();
  const { setBaselineFace } = useApp();

  const [status, setStatus] = useState('init'); // init, ready, calibrating, complete, error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Inicializando câmera...');
  const [error, setError] = useState(null);
  const [baselineData, setBaselineData] = useState(null);
  const [streamVersion, setStreamVersion] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const stream = streamRef.current;

    if (!video || !stream) {
      return;
    }

    let cancelled = false;

    const prepareVideo = async () => {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
        await new Promise((resolve) => {
          const handler = () => {
            video.removeEventListener('loadedmetadata', handler);
            resolve();
          };
          video.addEventListener('loadedmetadata', handler, { once: true });
        });
      }

      if (cancelled) return;

      try {
        await video.play();
      } catch (playError) {
        console.warn('Não foi possível iniciar o vídeo automaticamente:', playError);
      }

      if (cancelled) return;

      if (canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    prepareVideo();

    return () => {
      cancelled = true;
    };
  }, [status, streamVersion]);

  const initializeCamera = async () => {
    try {
      console.log('🎬 Initializing face recording camera...');

      // Request camera access
      console.log('📹 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 540 },
        },
        audio: false,
      });
      console.log('✅ Camera access granted');

      streamRef.current = stream;
      setStreamVersion((version) => version + 1);

      // Set video source
      if (videoRef.current) {
        console.log('🎥 Setting up video element...');
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video metadata loaded');
            resolve();
          };
        });
        await videoRef.current.play();
        console.log('✅ Video playing');

        // Wait for video to have valid dimensions
        console.log('⏳ Waiting for video dimensions...');
        await new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds max
          const checkDimensions = () => {
            attempts++;
            if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
              console.log(`✅ Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
              resolve();
            } else if (attempts >= maxAttempts) {
              console.error(`❌ Timeout waiting for video dimensions after ${attempts} attempts`);
              reject(new Error('Timeout esperando dimensões do vídeo. Tente recarregar a página.'));
            } else {
              console.log(`⏳ Video dimensions not ready yet... (attempt ${attempts}/${maxAttempts})`);
              setTimeout(checkDimensions, 100);
            }
          };
          checkDimensions();
        });

        // Set canvas size
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          console.log(`✅ Canvas set to ${canvasRef.current.width}x${canvasRef.current.height}`);
        }
      }

      // Initialize face detector
      setMessage('Carregando detector facial...');
      console.log('🤖 Initializing face detector...');
      faceDetectorRef.current = new FaceDetector();
      await faceDetectorRef.current.init();
      console.log('✅ Face detector initialized');

      setStatus('ready');
      setMessage('Pronto para iniciar');
      console.log('✅ Face recording ready!');
    } catch (err) {
      console.error('❌ Failed to initialize:', err);
      setError(err.message || 'Não foi possível acessar a câmera');
      setStatus('error');
    }
  };

  const handleStartCalibration = () => {
    console.log('🎬 Starting calibration...');
    console.log('faceDetectorRef:', faceDetectorRef.current);
    console.log('videoRef:', videoRef.current);
    console.log('video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);

    if (!faceDetectorRef.current || !videoRef.current) {
      console.error('❌ Sistema não inicializado');
      setError('Sistema não inicializado');
      setStatus('error');
      return;
    }

    // Validate video is ready
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.error('❌ Vídeo não está pronto');
      setError('Vídeo ainda não está pronto. Aguarde um momento e tente novamente.');
      setStatus('error');
      return;
    }

    console.log('✅ Starting calibration loop');
    setStatus('calibrating');
    setProgress(0);
    setMessage('Calibrando... Mantenha o rosto centralizado');

    // Start detection loop
    detectLoop();
  };

  const detectLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const detector = faceDetectorRef.current;

    // Stop if required resources are not available
    if (!video || !canvas || !ctx || !detector) {
      console.warn('Detection loop stopped: missing resources');
      return;
    }

    try {
      const timestamp = performance.now();
      const result = detector.detectFrame(video, timestamp);

      // Clear canvas and draw video
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (result.faceDetected) {
        // Draw landmarks
        if (result.landmarks) {
          drawLandmarks(
            ctx,
            result.landmarks,
            canvas.width,
            canvas.height,
            result.status === 'alert'
          );
        }

        // Update UI based on status
        if (result.status === 'calibrating') {
          setProgress(result.progress);
          setMessage(`Calibrando... ${Math.round(result.progress)}%`);
        } else if (result.status === 'ok' || result.status === 'alert') {
          // Calibration complete
          finishCalibration();
          return;
        }
      } else if (result.status === 'no_video') {
        // Video not ready yet, wait a bit
        setMessage('Aguardando vídeo...');
      } else {
        setMessage('Nenhum rosto detectado - centralize seu rosto');
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      console.error('Detection error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const finishCalibration = async () => {
    if (!faceDetectorRef.current) return;

    try {
      // Get baseline data
      const data = faceDetectorRef.current.getBaselineData();
      setBaselineData(data);

      // Save to context
      setBaselineFace(data);

      setStatus('complete');
      setMessage('Calibração completa!');
      setProgress(100);

      // Stop animation loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } catch (err) {
      console.error('Failed to finish calibration:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const handleContinue = () => {
    cleanup();
    navigate('/profile-created');
  };

  const handleRetry = () => {
    if (faceDetectorRef.current) {
      faceDetectorRef.current.reset();
    }
    setStatus('ready');
    setProgress(0);
    setMessage('Pronto para iniciar');
    setError(null);
    setBaselineData(null);
  };

  const cleanup = () => {
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    // Cleanup face detector
    if (faceDetectorRef.current) {
      faceDetectorRef.current.cleanup();
    }
  };

  // Render states
  if (status === 'init') {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container">
        <div className="icon danger">⚠️</div>
        <h1>Erro</h1>
        <p className="text-danger">{error}</p>
        <button className="button" onClick={initializeCamera}>
          TENTAR NOVAMENTE
        </button>
        <button className="button white mt-2" onClick={() => navigate(-1)}>
          VOLTAR
        </button>
      </div>
    );
  }

  if (status === 'complete' && baselineData) {
    return (
      <div className="container">
        <div className="icon success">✓</div>
        <h1>Calibração Facial Completa!</h1>

        <div className="card mt-3">
          <h3>Perfil Facial Criado</h3>
          <div className="mt-2">
            <p><strong>Baseline estabelecida:</strong> {baselineData.mean.toFixed(4)}</p>
            <p><strong>Frames analisados:</strong> {baselineData.frames}</p>
            <p className="text-muted mt-2">
              Seu perfil facial foi salvo com sucesso. O sistema irá monitorar assimetrias
              faciais que podem indicar sinais de AVC.
            </p>
          </div>
        </div>

        <div className="card mt-2 bg-info">
          <p className="mb-0">
            <strong>ℹ️ Importante:</strong> Durante o monitoramento, o sistema irá alertá-lo
            se detectar qualquer assimetria significativa em sua face.
          </p>
        </div>

        <button className="button green mt-3" onClick={handleContinue}>
          CONTINUAR
        </button>
        <button className="button white mt-2" onClick={handleRetry}>
          REFAZER CALIBRAÇÃO
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="progress-indicator">
        <div className="step">1</div>
        <div className="step-line"></div>
        <div className="step active">2</div>
      </div>

      <h1>Calibração Facial</h1>
      <p className="text-muted">Etapa 2 de 2 - Criação do Perfil</p>

      {status === 'ready' && (
        <div className="card mt-3">
          <h3>Instruções</h3>
          <ul className="text-left">
            <li>Posicione seu rosto centralizado na câmera</li>
            <li>Mantenha uma expressão <strong>neutra e relaxada</strong></li>
            <li>Evite movimentar muito a cabeça</li>
            <li>Mantenha boa iluminação no ambiente</li>
          </ul>
          <p className="text-muted mt-2">
            <em>O processo levará cerca de 3-5 segundos</em>
          </p>
        </div>
      )}

      <div className="video-container mt-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ display: status === 'calibrating' ? 'none' : 'block' }}
        />
        <canvas
          ref={canvasRef}
          style={{ display: status === 'calibrating' ? 'block' : 'none' }}
        />

        {status === 'ready' && (
          <div className="video-overlay">
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              padding: '12px 24px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              textAlign: 'center',
            }}>
              📹 Câmera ativa - Pronto para iniciar
            </div>
          </div>
        )}

        {status === 'calibrating' && (
          <div className="video-overlay">
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              padding: '12px 24px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
            }}>
              {message}
            </div>
          </div>
        )}
      </div>

      {status === 'calibrating' && (
        <div className="card mt-3">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, background: 'var(--primary-purple)' }}
            ></div>
          </div>
          <p className="text-center text-muted mt-2">{Math.round(progress)}% completo</p>
        </div>
      )}

      {status === 'ready' && (
        <>
          <button className="button purple mt-3" onClick={handleStartCalibration}>
            📹 INICIAR CALIBRAÇÃO
          </button>
          <button className="button white mt-2" onClick={() => navigate(-1)}>
            VOLTAR
          </button>
        </>
      )}
    </div>
  );
}

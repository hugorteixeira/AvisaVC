import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, riskScore, baselineVoice, baselineFace, getRiskLevel, logoutUser } = useApp();
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  const riskLevel = getRiskLevel();
  const hasProfile = baselineVoice && baselineFace;

  const handleEmergencyCall = () => {
    setShowEmergencyConfirm(true);
  };

  const confirmEmergency = () => {
    // In production, this would trigger actual emergency call
    const emergencyNumber = user?.emergencyContact?.phone || '192';
    alert(`Ligando para emergência: ${emergencyNumber}\n\nEm produção, isso iniciaria uma ligação real.`);
    setShowEmergencyConfirm(false);
    navigate('/results-attention');
  };

  const handleStartTest = () => {
    if (!hasProfile) {
      alert('Você precisa criar seu perfil antes de fazer os testes.');
      navigate('/voice-recording');
      return;
    }
    navigate('/test-facial');
  };

  const handleSwitchUser = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="container">
      {/* Header with User Info */}
      <div className="card mb-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Olá, {user?.name || 'Usuário'}!</h2>
            <p className="text-muted mb-0">Bem-vindo ao Arter.IA</p>
          </div>
          <div
            style={{
              fontSize: '3rem',
              opacity: 0.8
            }}
          >
            ❤️
          </div>
        </div>
      </div>

      {/* Risk Status Card */}
      <div
        className="card mb-3"
        style={{
          background: `linear-gradient(135deg, ${riskLevel.color}22 0%, ${riskLevel.color}11 100%)`,
          borderColor: riskLevel.color
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '8px' }}>Nível de Risco</h3>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: riskLevel.color,
              marginBottom: '8px'
            }}
          >
            {riskLevel.level}
          </div>
          <p className="text-muted mb-0">
            Pontuação: {riskScore}/40 pontos
          </p>
          {riskLevel.level === 'ALTO' && (
            <p className="text-danger mt-2" style={{ fontWeight: '600' }}>
              ⚠️ Atenção redobrada recomendada
            </p>
          )}
        </div>
      </div>

      {/* Profile Status */}
      <div className="card mb-3">
        <h3 style={{ marginBottom: '16px' }}>Status do Perfil</h3>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>
            {baselineVoice ? '✅' : '⭕'}
          </span>
          <div>
            <strong>Perfil de Voz</strong>
            <p className="text-muted mb-0">
              {baselineVoice
                ? `Baseline: ${baselineVoice.baseline.toFixed(2)} chars/s`
                : 'Não calibrado'
              }
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>
            {baselineFace ? '✅' : '⭕'}
          </span>
          <div>
            <strong>Perfil Facial</strong>
            <p className="text-muted mb-0">
              {baselineFace
                ? `Baseline: ${baselineFace.mean.toFixed(4)}`
                : 'Não calibrado'
              }
            </p>
          </div>
        </div>

        {!hasProfile && (
          <button
            className="button purple mt-2"
            onClick={() => navigate('/voice-recording')}
          >
            CRIAR MEU PERFIL
          </button>
        )}
      </div>

      {/* Emergency Contact */}
      {user?.emergencyContact && (
        <div className="card mb-3 bg-info">
          <h3 style={{ marginBottom: '8px' }}>Contato de Emergência</h3>
          <p className="mb-0">
            <strong>{user.emergencyContact.name}</strong>
          </p>
          <p className="text-muted mb-0">
            {user.emergencyContact.phone}
          </p>
        </div>
      )}

      {/* Main Actions */}
      <div style={{ marginTop: '24px' }}>
        <button
          className="button large mb-2"
          style={{
            background: 'var(--primary-red)',
            fontSize: '1.2rem',
            padding: '20px'
          }}
          onClick={handleEmergencyCall}
        >
          🚨 ACIONAR EMERGÊNCIA
        </button>

        <button
          className="button purple large mb-2"
          onClick={handleStartTest}
          disabled={!hasProfile}
        >
          🧪 INICIAR TESTE FAST
        </button>

        <button
          className="button blue large mb-2"
          onClick={() => navigate('/voice-recording')}
        >
          🔄 RECALIBRAR PERFIL
        </button>
      </div>

      {/* Quick Info */}
      <div className="card mt-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <h3 style={{ marginBottom: '12px' }}>Protocolo FAST</h3>
        <div style={{ fontSize: '0.9rem' }}>
          <p className="mb-1"><strong>F</strong>ace (Rosto) - Assimetria facial</p>
          <p className="mb-1"><strong>A</strong>rms (Braços) - Fraqueza nos braços</p>
          <p className="mb-1"><strong>S</strong>peech (Fala) - Dificuldade de fala</p>
          <p className="mb-0"><strong>T</strong>ime (Tempo) - Acionar emergência rápido</p>
        </div>
      </div>

      {/* Emergency Confirmation Modal */}
      {showEmergencyConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="icon danger">⚠️</div>
            <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>
              Confirmar Emergência
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '24px' }}>
              Deseja acionar o contato de emergência?
            </p>
            <p className="text-muted" style={{ textAlign: 'center', marginBottom: '24px' }}>
              {user?.emergencyContact
                ? `Ligará para: ${user.emergencyContact.name}`
                : 'Ligará para: 192 (SAMU)'
              }
            </p>
            <button
              className="button mb-2"
              onClick={confirmEmergency}
            >
              SIM, LIGAR AGORA
            </button>
            <button
              className="button white"
              onClick={() => setShowEmergencyConfirm(false)}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* Footer with Settings */}
      <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className="button outline"
          onClick={() => alert('Configurações em desenvolvimento')}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          ⚙️ Configurações
        </button>
        <button
          className="button outline"
          onClick={handleSwitchUser}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          🔄 Trocar Usuário
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function ProfileCreated() {
  const navigate = useNavigate();
  const { user, baselineVoice, baselineFace, getRiskLevel } = useApp();

  const riskLevel = getRiskLevel();

  return (
    <div className="container">
      <div className="icon success" style={{ fontSize: '5rem' }}>
        ✓
      </div>

      <h1>Perfil Criado com Sucesso!</h1>
      <p className="text-muted">Seu sistema de monitoramento está ativo</p>

      {/* Summary Card */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px' }}>Resumo do Perfil</h3>

        {user && (
          <div style={{ marginBottom: '16px' }}>
            <p><strong>Nome:</strong> {user.name}</p>
            <p><strong>Idade:</strong> {user.age} anos</p>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <strong>Perfil de Voz</strong>
              {baselineVoice && (
                <p className="text-muted mb-0">
                  Baseline: {baselineVoice.baseline.toFixed(2)} chars/s
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <strong>Perfil Facial</strong>
              {baselineFace && (
                <p className="text-muted mb-0">
                  Baseline: {baselineFace.mean.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Level Card */}
      <div
        className="card mt-3"
        style={{
          background: `linear-gradient(135deg, ${riskLevel.color}22 0%, ${riskLevel.color}11 100%)`,
          borderColor: riskLevel.color
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '8px' }}>Nível de Risco</h3>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: riskLevel.color }}>
            {riskLevel.level}
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="card mt-3 bg-info">
        <h3 style={{ marginBottom: '12px' }}>Recursos Ativados</h3>
        <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
          <li>Monitoramento contínuo de fala</li>
          <li>Detecção de assimetria facial</li>
          <li>Testes FAST disponíveis</li>
          <li>Alertas em tempo real</li>
          <li>Botão de emergência</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <button
        className="button green large mt-3"
        onClick={() => navigate('/dashboard')}
      >
        IR PARA O DASHBOARD
      </button>

      <button
        className="button purple large mt-2"
        onClick={() => navigate('/test-facial')}
      >
        FAZER PRIMEIRO TESTE FAST
      </button>

      {/* Info */}
      <div className="card mt-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem', textAlign: 'center' }}>
          Você pode acessar seu dashboard a qualquer momento para realizar testes
          ou verificar seu status de risco.
        </p>
      </div>
    </div>
  );
}

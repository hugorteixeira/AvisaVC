import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function RiskResult() {
  const navigate = useNavigate();
  const { riskScore, user, getRiskLevel } = useApp();

  const riskLevel = getRiskLevel();

  const recommendations = {
    BAIXO: [
      'Continue mantendo hábitos saudáveis',
      'Pratique exercícios físicos regularmente',
      'Mantenha uma alimentação balanceada',
      'Realize check-ups médicos anuais'
    ],
    MODERADO: [
      'Consulte um médico para avaliação detalhada',
      'Monitore sua pressão arterial regularmente',
      'Reduza consumo de sal e gorduras',
      'Pratique atividades físicas pelo menos 3x/semana',
      'Controle o estresse com técnicas de relaxamento'
    ],
    ALTO: [
      'IMPORTANTE: Consulte um médico urgentemente',
      'Faça exames de rotina com frequência',
      'Controle rigorosamente pressão e glicemia',
      'Siga orientações médicas rigorosamente',
      'Considere mudanças significativas no estilo de vida',
      'Mantenha medicamentos em dia se prescritos'
    ]
  };

  const getIcon = () => {
    switch (riskLevel.level) {
      case 'BAIXO':
        return '✓';
      case 'MODERADO':
        return '⚠️';
      case 'ALTO':
        return '🚨';
      default:
        return '📊';
    }
  };

  return (
    <div className="container">
      <div className="progress-bar mb-3">
        <div className="progress-bar-fill" style={{ width: '40%' }}></div>
      </div>

      {/* Result Card */}
      <div
        className="card text-center"
        style={{
          background: `linear-gradient(135deg, ${riskLevel.color}22 0%, ${riskLevel.color}11 100%)`,
          borderColor: riskLevel.color
        }}
      >
        <div className="icon" style={{ color: riskLevel.color, fontSize: '4rem' }}>
          {getIcon()}
        </div>

        <h1 style={{ color: riskLevel.color, marginBottom: '8px' }}>
          Risco {riskLevel.level}
        </h1>

        <p className="text-muted mb-0">
          Pontuação: {riskScore} de 40 pontos
        </p>

        {user?.name && (
          <p className="text-muted mt-2">
            {user.name}, sua avaliação está completa
          </p>
        )}
      </div>

      {/* Interpretation */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '12px' }}>O que significa?</h3>

        {riskLevel.level === 'BAIXO' && (
          <p>
            Você apresenta <strong>baixo risco</strong> de AVC baseado nos fatores analisados.
            Continue mantendo hábitos saudáveis e faça acompanhamento médico regular.
          </p>
        )}

        {riskLevel.level === 'MODERADO' && (
          <p>
            Você apresenta <strong>risco moderado</strong> de AVC. É importante consultar
            um médico para avaliação detalhada e considerar mudanças no estilo de vida.
          </p>
        )}

        {riskLevel.level === 'ALTO' && (
          <p>
            Você apresenta <strong>alto risco</strong> de AVC baseado nos fatores analisados.
            É <strong>fundamental</strong> procurar orientação médica o mais breve possível.
          </p>
        )}
      </div>

      {/* Recommendations */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '12px' }}>Recomendações</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {recommendations[riskLevel.level].map((rec, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      <div className="card mt-3 bg-info">
        <h3 style={{ marginBottom: '12px' }}>Próximos Passos</h3>
        <p className="mb-0">
          Agora vamos criar seu <strong>perfil de monitoramento</strong> com calibração
          de voz e detecção facial. Isso permitirá que o sistema detecte possíveis
          sinais precoces de AVC em tempo real.
        </p>
      </div>

      {/* Action Buttons */}
      <button
        className="button green large mt-3"
        onClick={() => navigate('/voice-recording')}
      >
        CRIAR MEU PERFIL DE MONITORAMENTO
      </button>

      {riskLevel.level === 'ALTO' && (
        <div className="card mt-2" style={{ background: 'rgba(220, 53, 69, 0.1)', borderColor: 'var(--primary-red)' }}>
          <p className="mb-0" style={{ color: 'var(--primary-red)', fontWeight: '600' }}>
            ⚠️ Atenção: Devido ao seu alto risco, recomendamos fortemente consultar
            um médico antes de continuar.
          </p>
        </div>
      )}

      <button
        className="button white mt-2"
        onClick={() => navigate('/question/8')}
      >
        REVER RESPOSTAS
      </button>

      {/* Disclaimer */}
      <div className="card mt-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          <strong>⚠️ Aviso Importante:</strong> Esta avaliação é apenas informativa e não substitui
          consulta médica profissional. Em caso de sintomas de AVC, ligue 192 imediatamente.
        </p>
      </div>
    </div>
  );
}

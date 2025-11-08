import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

// 8 perguntas de avaliação de risco de AVC
const QUESTIONS = [
  {
    id: 1,
    question: 'Você tem histórico de pressão alta (hipertensão)?',
    points: 5,
    info: 'A hipertensão é um dos principais fatores de risco para AVC'
  },
  {
    id: 2,
    question: 'Você tem diabetes?',
    points: 5,
    info: 'O diabetes aumenta significativamente o risco de AVC'
  },
  {
    id: 3,
    question: 'Você fuma ou já fumou nos últimos 5 anos?',
    points: 5,
    info: 'O tabagismo danifica os vasos sanguíneos e aumenta o risco de AVC'
  },
  {
    id: 4,
    question: 'Você tem histórico familiar de AVC?',
    points: 5,
    info: 'Pessoas com familiares que tiveram AVC têm maior risco'
  },
  {
    id: 5,
    question: 'Você tem colesterol alto?',
    points: 5,
    info: 'Colesterol elevado pode obstruir artérias e causar AVC'
  },
  {
    id: 6,
    question: 'Você tem problemas cardíacos (arritmia, fibrilação atrial)?',
    points: 5,
    info: 'Problemas cardíacos aumentam o risco de formação de coágulos'
  },
  {
    id: 7,
    question: 'Você é sedentário(a) ou pratica pouca atividade física?',
    points: 5,
    info: 'Sedentarismo está associado a maior risco de AVC'
  },
  {
    id: 8,
    question: 'Você tem mais de 55 anos?',
    points: 5,
    info: 'O risco de AVC aumenta com a idade'
  }
];

export default function Question() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { answers, setAnswer, addToRiskScore, user } = useApp();

  const questionNumber = parseInt(id);
  const currentQuestion = QUESTIONS[questionNumber - 1];

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Load previous answer if exists
    if (answers[questionNumber]) {
      setSelected(answers[questionNumber]);
    }
  }, [questionNumber, answers]);

  if (!currentQuestion) {
    navigate('/risk-result');
    return null;
  }

  const handleAnswer = (answer) => {
    setSelected(answer);
  };

  const handleNext = () => {
    if (selected === null) {
      alert('Por favor, selecione uma resposta');
      return;
    }

    // Save answer
    setAnswer(questionNumber, selected);

    // Add to risk score if answered yes
    if (selected === 'yes') {
      addToRiskScore(currentQuestion.points);
    }

    // Go to next question or results
    if (questionNumber < QUESTIONS.length) {
      navigate(`/question/${questionNumber + 1}`);
    } else {
      navigate('/risk-result');
    }
  };

  const handlePrevious = () => {
    if (questionNumber > 1) {
      navigate(`/question/${questionNumber - 1}`);
    } else {
      navigate('/register');
    }
  };

  const progress = (questionNumber / QUESTIONS.length) * 100;

  return (
    <div className="container">
      {/* Progress Bar */}
      <div className="progress-header mb-3">
        <span>Pergunta {questionNumber} de {QUESTIONS.length}</span>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card mt-3">
        <h2 style={{ marginBottom: '16px' }}>{currentQuestion.question}</h2>

        <div className="card bg-info mt-2 mb-3">
          <p className="mb-0" style={{ fontSize: '0.9rem' }}>
            <strong>ℹ️ Info:</strong> {currentQuestion.info}
          </p>
        </div>

        {/* Answer Options */}
        <div style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
          <button
            className={`button large ${selected === 'yes' ? 'green' : 'outline'}`}
            onClick={() => handleAnswer('yes')}
            style={{
              background: selected === 'yes' ? 'var(--primary-green)' : 'transparent',
              borderColor: selected === 'yes' ? 'var(--primary-green)' : 'var(--border-color)'
            }}
          >
            ✓ SIM
          </button>

          <button
            className={`button large ${selected === 'no' ? 'blue' : 'outline'}`}
            onClick={() => handleAnswer('no')}
            style={{
              background: selected === 'no' ? 'var(--primary-blue)' : 'transparent',
              borderColor: selected === 'no' ? 'var(--primary-blue)' : 'var(--border-color)'
            }}
          >
            ✗ NÃO
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="button green mt-3"
        onClick={handleNext}
        disabled={selected === null}
      >
        {questionNumber < QUESTIONS.length ? 'PRÓXIMA PERGUNTA' : 'VER RESULTADO'}
      </button>

      {questionNumber > 1 && (
        <button
          className="button white mt-2"
          onClick={handlePrevious}
        >
          VOLTAR
        </button>
      )}

      {/* Help Text */}
      <p className="text-muted text-center mt-3" style={{ fontSize: '0.85rem' }}>
        {user?.name ? `${user.name}, ` : ''}responda com sinceridade para uma avaliação precisa
      </p>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResultsAttention() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="icon danger">⚠</div>
      <h1>ATENÇÃO NECESSÁRIA</h1>
      <button className="button" onClick={() => alert('Ligando para emergência...')}>
        ACIONAR EMERGÊNCIA
      </button>
      <button className="button white mt-2" onClick={() => navigate('/dashboard')}>
        VOLTAR AO DASHBOARD
      </button>
    </div>
  );
}

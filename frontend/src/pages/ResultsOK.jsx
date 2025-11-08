import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResultsOK() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="icon success">✓</div>
      <h1>TESTES OK</h1>
      <button className="button green" onClick={() => navigate('/dashboard')}>
        VOLTAR AO DASHBOARD
      </button>
    </div>
  );
}

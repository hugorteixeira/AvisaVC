import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function Register() {
  const navigate = useNavigate();
  const { createNewUser } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatPhone = (value) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');

    // Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    const formatted = formatPhone(value);

    if (name.startsWith('emergency_')) {
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          phone: formatted
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        phone: formatted
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    // Idade
    if (!formData.age) {
      newErrors.age = 'Idade é obrigatória';
    } else if (formData.age < 18 || formData.age > 120) {
      newErrors.age = 'Idade deve estar entre 18 e 120';
    }

    // Telefone
    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (phoneNumbers.length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    // Contato de emergência - nome
    if (!formData.emergencyContact.name.trim()) {
      newErrors.emergency_name = 'Nome do contato de emergência é obrigatório';
    }

    // Contato de emergência - telefone
    const emergencyPhoneNumbers = formData.emergencyContact.phone.replace(/\D/g, '');
    if (!formData.emergencyContact.phone) {
      newErrors.emergency_phone = 'Telefone de emergência é obrigatório';
    } else if (emergencyPhoneNumbers.length < 10) {
      newErrors.emergency_phone = 'Telefone inválido';
    }

    // Contato de emergência - relação
    if (!formData.emergencyContact.relationship) {
      newErrors.emergency_relationship = 'Relação é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Criar novo usuário
    createNewUser({
      name: formData.name.trim(),
      age: parseInt(formData.age),
      phone: formData.phone,
      emergencyContact: {
        name: formData.emergencyContact.name.trim(),
        phone: formData.emergencyContact.phone,
        relationship: formData.emergencyContact.relationship
      }
    });

    // Ir para o questionário
    navigate('/question/1');
  };

  return (
    <div className="container">
      <div className="progress-bar mb-3">
        <div className="progress-bar-fill" style={{ width: '10%' }}></div>
      </div>

      <h1>Cadastro Inicial</h1>
      <p className="text-muted">Preencha seus dados para começar</p>

      <form onSubmit={handleSubmit}>
        {/* Dados Pessoais */}
        <div className="card mt-3">
          <h3 style={{ marginBottom: '16px' }}>Seus Dados</h3>

          <div className="input-group">
            <label htmlFor="name">Nome Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="text-danger">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="age">Idade *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Digite sua idade"
              min="18"
              max="120"
              className={errors.age ? 'error' : ''}
            />
            {errors.age && <span className="text-danger">{errors.age}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="phone">Telefone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              maxLength="15"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="text-danger">{errors.phone}</span>}
          </div>
        </div>

        {/* Contato de Emergência */}
        <div className="card mt-3">
          <h3 style={{ marginBottom: '8px' }}>Contato de Emergência</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            Será acionado em caso de detecção de sinais de AVC
          </p>

          <div className="input-group">
            <label htmlFor="emergency_name">Nome do Contato *</label>
            <input
              type="text"
              id="emergency_name"
              name="emergency_name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              placeholder="Nome da pessoa de contato"
              className={errors.emergency_name ? 'error' : ''}
            />
            {errors.emergency_name && (
              <span className="text-danger">{errors.emergency_name}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="emergency_phone">Telefone do Contato *</label>
            <input
              type="tel"
              id="emergency_phone"
              name="emergency_phone"
              value={formData.emergencyContact.phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              maxLength="15"
              className={errors.emergency_phone ? 'error' : ''}
            />
            {errors.emergency_phone && (
              <span className="text-danger">{errors.emergency_phone}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="emergency_relationship">Relação *</label>
            <select
              id="emergency_relationship"
              name="emergency_relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleChange}
              className={errors.emergency_relationship ? 'error' : ''}
            >
              <option value="">Selecione...</option>
              <option value="spouse">Cônjuge</option>
              <option value="parent">Pai/Mãe</option>
              <option value="child">Filho(a)</option>
              <option value="sibling">Irmão(ã)</option>
              <option value="friend">Amigo(a)</option>
              <option value="other">Outro</option>
            </select>
            {errors.emergency_relationship && (
              <span className="text-danger">{errors.emergency_relationship}</span>
            )}
          </div>
        </div>

        {/* Aviso */}
        <div className="card mt-3 bg-info">
          <p className="mb-0" style={{ fontSize: '0.9rem' }}>
            <strong>ℹ️ Privacidade:</strong> Seus dados são armazenados localmente
            no navegador e não são enviados para servidores externos.
          </p>
        </div>

        {/* Botões */}
        <button type="submit" className="button green mt-3">
          CONTINUAR PARA AVALIAÇÃO
        </button>

        <button
          type="button"
          className="button white mt-2"
          onClick={() => navigate('/')}
        >
          VOLTAR
        </button>
      </form>
    </div>
  );
}

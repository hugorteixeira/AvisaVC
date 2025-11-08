import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Helper functions for multi-user management
const getAllUsers = () => {
  const saved = localStorage.getItem('arteriaUsers');
  return saved ? JSON.parse(saved) : [];
};

const saveAllUsers = (users) => {
  localStorage.setItem('arteriaUsers', JSON.stringify(users));
};

const getCurrentUserId = () => {
  return localStorage.getItem('currentUserId');
};

const setCurrentUserId = (userId) => {
  if (userId) {
    localStorage.setItem('currentUserId', userId);
  } else {
    localStorage.removeItem('currentUserId');
  }
};

const getUserById = (userId) => {
  const users = getAllUsers();
  return users.find(u => u.id === userId) || null;
};

export const AppProvider = ({ children }) => {
  // Current user ID
  const [currentUserId, setCurrentUserIdState] = useState(() => getCurrentUserId());

  // Load current user data
  const loadUserData = (userId) => {
    if (!userId) {
      return {
        user: null,
        riskScore: 0,
        baselineVoice: null,
        baselineFace: null,
        answers: {}
      };
    }

    const userData = getUserById(userId);
    if (!userData) {
      return {
        user: null,
        riskScore: 0,
        baselineVoice: null,
        baselineFace: null,
        answers: {}
      };
    }

    return {
      user: {
        id: userData.id,
        name: userData.name,
        age: userData.age,
        phone: userData.phone,
        emergencyContact: userData.emergencyContact
      },
      riskScore: userData.riskScore || 0,
      baselineVoice: userData.baselineVoice || null,
      baselineFace: userData.baselineFace || null,
      answers: userData.answers || {}
    };
  };

  const initialData = loadUserData(currentUserId);

  const [user, setUserState] = useState(initialData.user);
  const [riskScore, setRiskScoreState] = useState(initialData.riskScore);
  const [baselineVoice, setBaselineVoiceState] = useState(initialData.baselineVoice);
  const [baselineFace, setBaselineFaceState] = useState(initialData.baselineFace);
  const [answers, setAnswersState] = useState(initialData.answers);

  const [sessionId] = useState(() =>
    crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
  );

  // Save current user data to the users array whenever it changes
  useEffect(() => {
    if (!currentUserId || !user) return;

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUserId);

    const userData = {
      id: currentUserId,
      name: user.name,
      age: user.age,
      phone: user.phone,
      emergencyContact: user.emergencyContact,
      riskScore,
      baselineVoice,
      baselineFace,
      answers,
      updatedAt: new Date().toISOString()
    };

    if (userIndex >= 0) {
      users[userIndex] = userData;
    } else {
      userData.createdAt = new Date().toISOString();
      users.push(userData);
    }

    saveAllUsers(users);
  }, [currentUserId, user, riskScore, baselineVoice, baselineFace, answers]);

  // Setters that update state
  const setUser = (userData) => {
    setUserState(userData);
  };

  const setRiskScore = (score) => {
    setRiskScoreState(score);
  };

  const setBaselineVoice = (baseline) => {
    setBaselineVoiceState(baseline);
  };

  const setBaselineFace = (baseline) => {
    setBaselineFaceState(baseline);
  };

  const setAnswer = (questionNumber, answer) => {
    setAnswersState(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  const addToRiskScore = (points) => {
    setRiskScoreState(prev => prev + points);
  };

  const getRiskLevel = () => {
    if (riskScore >= 15) return { level: 'ALTO', color: '#dc3545' };
    if (riskScore >= 8) return { level: 'MODERADO', color: '#ffc107' };
    return { level: 'BAIXO', color: '#28a745' };
  };

  // Multi-user functions
  const createNewUser = (userData) => {
    const userId = crypto?.randomUUID?.() || `user_${Date.now()}`;

    setCurrentUserId(userId);
    setCurrentUserIdState(userId);

    setUserState({
      id: userId,
      ...userData
    });
    setRiskScoreState(0);
    setBaselineVoiceState(null);
    setBaselineFaceState(null);
    setAnswersState({});
  };

  const loginUser = (userId) => {
    const userData = loadUserData(userId);

    setCurrentUserId(userId);
    setCurrentUserIdState(userId);

    setUserState(userData.user);
    setRiskScoreState(userData.riskScore);
    setBaselineVoiceState(userData.baselineVoice);
    setBaselineFaceState(userData.baselineFace);
    setAnswersState(userData.answers);
  };

  const logoutUser = () => {
    setCurrentUserId(null);
    setCurrentUserIdState(null);

    setUserState(null);
    setRiskScoreState(0);
    setBaselineVoiceState(null);
    setBaselineFaceState(null);
    setAnswersState({});
  };

  const deleteUser = (userId) => {
    const users = getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    saveAllUsers(filteredUsers);

    // If deleting current user, logout
    if (userId === currentUserId) {
      logoutUser();
    }
  };

  const resetData = () => {
    if (currentUserId) {
      deleteUser(currentUserId);
    }
  };

  return (
    <AppContext.Provider value={{
      // Current user data
      user, setUser,
      riskScore, setRiskScore,
      baselineVoice, setBaselineVoice,
      baselineFace, setBaselineFace,
      answers, setAnswer, addToRiskScore,
      sessionId,
      getRiskLevel,
      resetData,
      // Multi-user functions
      createNewUser,
      loginUser,
      logoutUser,
      deleteUser,
      getAllUsers
    }}>
      {children}
    </AppContext.Provider>
  );
};

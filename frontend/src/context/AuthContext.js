import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      const storedToken = await AsyncStorage.getItem('@flux_token');
      const storedUser = await AsyncStorage.getItem('@flux_user');

      if (storedToken && storedUser) {
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    loadStorageData();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      await AsyncStorage.setItem('@flux_token', token);
      await AsyncStorage.setItem('@flux_user', JSON.stringify(userData));

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
    } catch (error) {
      throw new Error("Credenciais inválidas");
    }
  };

  // Nova função de Cadastro ajustada para a rota correta
  const register = async (name, email, password) => {
    try {
      // Ajuste feito aqui: rota alterada para '/auth/register'
      await api.post('/auth/register', { name, email, password });
      
      // Se criou com sucesso, já faz o login automático para liberar o acesso
      await login(email, password);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw new Error("Não foi possível criar a conta. Verifique os dados.");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@flux_token');
    await AsyncStorage.removeItem('@flux_user');
    api.defaults.headers.Authorization = '';
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
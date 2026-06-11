import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      // Repassa os dados diretamente do backend, sem tentar formatar palavras antigas!
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    if (user) fetchTransactions();
    else setTransactions([]);
  }, [user]);

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      await api.post('/transactions', transactionData);
      await fetchTransactions(); // Atualiza a lista na tela imediatamente
    } catch (error) {
      // Pega o erro real do Zod (ex: falta um campo) e exibe na tela para sabermos o que foi
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      Alert.alert('Erro do Servidor', JSON.stringify(errorMessage));
      throw error; // Avisa a tela que deu erro para não fechar o modal
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
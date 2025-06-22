import { useState, useEffect, useCallback } from 'react';
import apiCliente from '../api/apiCliente';

export const useNotificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [totalNotificacoes, setTotalNotificacoes] = useState(0);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carregarNotificacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiCliente.get('/notificacoes');
      
      if (response.data) {
        setNotificacoes(response.data.notificacoes || []);
        setTotalNotificacoes(response.data.total || 0);
        setNaoLidas(response.data.nao_lidas || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarComoLida = async (notificacaoId) => {
    try {
      await apiCliente.post(`/notificacoes/${notificacaoId}/marcar-lida`);
      
      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === notificacaoId 
            ? { ...notif, lida: true }
            : notif
        )
      );
      
      setNaoLidas(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await apiCliente.post('/notificacoes/marcar-todas-lidas');
      
      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, lida: true }))
      );
      
      setNaoLidas(0);
      return true;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      carregarNotificacoes();
    }
  }, [carregarNotificacoes]);

  // Polling para atualizar notificações a cada 30 segundos
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const interval = setInterval(() => {
      carregarNotificacoes();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [carregarNotificacoes]);

  return {
    notificacoes,
    totalNotificacoes,
    naoLidas,
    loading,
    error,
    carregarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas
  };
};

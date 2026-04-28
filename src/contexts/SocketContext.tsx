import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Notificacion } from '@/types';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  notificaciones: Notificacion[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotificacion: (id: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useNotifications must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Inicializar socket cuando hay token
  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const newSocket = io(`${API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification socket');
      newSocket.emit('registrar_usuario');
    });

    newSocket.on('nueva_notificacion', (notif: Notificacion) => {
      setNotificaciones((prev) => {
        if (prev.some(n => n.pk_num_notificacion === notif.pk_num_notificacion)) {
          return prev;
        }
        return [notif, ...prev];
      });
      if (!notif.leida) {
        toast.info(notif.titulo, {
          description: notif.mensaje,
        });
      }
    });

    newSocket.on('conteo_no_leidas', (data: { total: number }) => {
      setUnreadCount(data.total);
    });

    newSocket.on('notificacion_leida', (data: { notificacionId: number }) => {
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.pk_num_notificacion === data.notificacionId ? { ...n, leida: true } : n
        )
      );
    });

    newSocket.on('todas_leidas_global', () => {
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const markAsRead = useCallback((id: number) => {
    // Aquí podrías llamar al servicio API también, pero el socket emitirá el cambio globalmente
    // Para una mejor UX, marcamos localmente primero o esperamos al evento del socket
  }, []);

  const markAllAsRead = useCallback(() => {
    // API call usually handled by notificationService, socket will broadcast
  }, []);

  const deleteNotificacion = useCallback((id: number) => {
    setNotificaciones((prev) => prev.filter(n => n.pk_num_notificacion !== id));
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notificaciones,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotificacion,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

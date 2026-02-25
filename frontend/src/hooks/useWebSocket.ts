import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

interface UseWebSocketProps {
    room_id: string;
    onMessage?: (data: any) => void;
}

export const useWebSocket = ({ room_id, onMessage }: UseWebSocketProps) => {
    const { token } = useAuthStore();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (!token || !room_id) return;

        const wsUrl = `${import.meta.env.VITE_WS_URL}/room/${room_id}?token=${token}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (onMessage) onMessage(data);
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
            // Attempt to reconnect after 3 seconds
            setTimeout(connect, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            ws.close();
        };
    }, [room_id, token, onMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    return { isConnected };
};

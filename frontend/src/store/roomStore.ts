import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '../types';

interface RoomState {
    currentRoom: Room | null;
    isLoggingChore: boolean;
    setRoom: (room: Room) => void;
    clearRoom: () => void;
    setIsLoggingChore: (isOpen: boolean) => void;
}

export const useRoomStore = create<RoomState>()(
    persist(
        (set) => ({
            currentRoom: null,
            isLoggingChore: false,
            setRoom: (room) => set({ currentRoom: room }),
            clearRoom: () => set({ currentRoom: null }),
            setIsLoggingChore: (isOpen) => set({ isLoggingChore: isOpen }),
        }),
        {
            name: 'room-storage',
        }
    )
);

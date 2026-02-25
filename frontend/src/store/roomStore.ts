import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '../types';

interface RoomState {
    currentRoom: Room | null;
    setRoom: (room: Room) => void;
    clearRoom: () => void;
}

export const useRoomStore = create<RoomState>()(
    persist(
        (set) => ({
            currentRoom: null,
            setRoom: (room) => set({ currentRoom: room }),
            clearRoom: () => set({ currentRoom: null }),
        }),
        {
            name: 'room-storage',
        }
    )
);

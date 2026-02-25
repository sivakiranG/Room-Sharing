import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useRoomStore } from '../store/roomStore';
import type { Item } from '../types';
import ItemCard from '../components/ItemCard';
import ConsumeModal from '../components/ConsumeModal';
import LogChoreModal from '../components/LogChoreModal';
import { Plus, Check, Hash, DoorOpen, Loader2, RefreshCw, ShoppingCart, AlertTriangle, Sparkles } from 'lucide-react';

const Dashboard = () => {
    const { currentRoom, setRoom, clearRoom } = useRoomStore();
    const queryClient = useQueryClient();
    const [isCopied, setIsCopied] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [isLoggingChore, setIsLoggingChore] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [itemToConsume, setItemToConsume] = useState<Item | null>(null);
    const [newItem, setNewItem] = useState({ name: '', total_quantity: 0, unit: 'pieces' });

    // Queries
    const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery<Item[]>({
        queryKey: ['items', currentRoom?.id],
        queryFn: async () => {
            const { data } = await api.get(`/rooms/${currentRoom?.id}/items`);
            return data;
        },
        enabled: !!currentRoom?.id,
        refetchInterval: 10000, // Still keep it fresh every 10s as a fallback
    });

    // Mutations
    const joinRoomMutation = useMutation({
        mutationFn: async (invite_code: string) => {
            const { data } = await api.post('/rooms/join', { invite_code });
            return data;
        },
        onSuccess: (data) => setRoom(data),
    });

    const createRoomMutation = useMutation({
        mutationFn: async (name: string) => {
            const { data } = await api.post('/rooms', { name });
            return data;
        },
        onSuccess: (data) => setRoom(data),
    });

    const addItemMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post(`/rooms/${currentRoom?.id}/items`, newItem);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setIsAddingItem(false);
            setNewItem({ name: '', total_quantity: 0, unit: 'pieces' });
        },
    });

    const consumeMutation = useMutation({
        mutationFn: async ({ itemId, quantity, userId }: { itemId: string; quantity: number; userId?: string }) => {
            const { data } = await api.post(`/items/${itemId}/consume`, { quantity, user_id: userId });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setItemToConsume(null);
        },
    });

    const logChoreMutation = useMutation({
        mutationFn: async (chore_type: string) => {
            const { data } = await api.post(`/rooms/${currentRoom?.id}/chores`, { chore_type });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activity'] });
            setIsLoggingChore(false);
        },
    });

    const copyInviteCode = () => {
        if (currentRoom?.invite_code) {
            navigator.clipboard.writeText(currentRoom.invite_code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleConsume = (itemId: string) => {
        const item = items?.find(i => i.id === itemId);
        if (item) {
            setItemToConsume(item);
        }
    };

    const handleRefill = (item: Item) => {
        setNewItem({
            name: item.name,
            total_quantity: item.total_quantity,
            unit: item.unit,
        });
        setIsAddingItem(true);
    };

    // ── No Room View ───────────────────────────────────────────────────────────
    if (!currentRoom) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 italic">Get Started</h1>
                    <p className="text-slate-600 dark:text-slate-400">Join an existing room or create a new one for your house.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center space-x-3 mb-6">
                            <Hash className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-xl font-bold dark:text-white">Join Room</h2>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter Invite Code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            />
                            <button
                                onClick={() => joinRoomMutation.mutate(joinCode)}
                                disabled={joinRoomMutation.isPending || !joinCode}
                                className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {joinRoomMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Join Room</span>}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center space-x-3 mb-6">
                            <DoorOpen className="w-5 h-5 text-purple-500" />
                            <h2 className="text-xl font-bold dark:text-white">New Room</h2>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Room Name (e.g. 221B Baker St)"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 dark:text-white"
                            />
                            <button
                                onClick={() => createRoomMutation.mutate(newRoomName)}
                                disabled={createRoomMutation.isPending || !newRoomName}
                                className="w-full py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {createRoomMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Room</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Dashboard View ─────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            {/* Header Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Invite Friends</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold truncate">{currentRoom.invite_code}</h2>
                        <button
                            onClick={copyInviteCode}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                        >
                            {isCopied ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5 rotate-45" />}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Items</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold dark:text-white">{items?.length || 0}</h2>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Low Stock</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold dark:text-white">
                            {items?.filter(i => (i.remaining_quantity / i.total_quantity) < 0.2 && i.remaining_quantity > 0).length || 0}
                        </h2>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Inventory Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Inventory</h1>
                    <p className="text-slate-600 dark:text-slate-400 italic">Manage your shared groceries in real-time.</p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsLoggingChore(true)}
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-6 py-3 rounded-2xl font-bold flex items-center shadow-sm transition-transform active:scale-95"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Log Cleaning
                    </button>
                    <button
                        onClick={() => setIsAddingItem(true)}
                        className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg transition-transform active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Item
                    </button>
                </div>
            </div>

            {/* Items Grid */}
            {itemsError ? (
                <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[3rem]">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-900 dark:text-red-400 font-bold text-lg">Failed to load inventory</p>
                    <p className="text-red-600 dark:text-red-500 mb-6">This could be due to a connection error or you might no longer have access to this room.</p>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['items'] })}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => clearRoom()}
                        className="ml-4 px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        Switch Room
                    </button>
                </div>
            ) : itemsLoading ? (
                <div className="flex justify-center items-center py-20">
                    <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items?.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onConsume={handleConsume}
                            onRefill={handleRefill}
                        />
                    ))}
                    {items?.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-100 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No items yet. Start by adding one!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Item Modal (Simple implementation) */}
            {isAddingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Grocery Item</h2>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-500 ml-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Eggs"
                                    autoFocus
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-500 ml-1">Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="30"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        value={newItem.total_quantity || ''}
                                        onChange={(e) => setNewItem({ ...newItem, total_quantity: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-500 ml-1">Unit</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none"
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="pieces">Pieces</option>
                                        <option value="liters">Liters</option>
                                        <option value="kg">KG</option>
                                        <option value="ml">ML</option>
                                        <option value="packs">Packs</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-8">
                                <button
                                    onClick={() => setIsAddingItem(false)}
                                    className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => addItemMutation.mutate()}
                                    disabled={!newItem.name || !newItem.total_quantity}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Consume Modal */}
            {itemToConsume && (
                <ConsumeModal
                    item={itemToConsume}
                    members={currentRoom.members}
                    onClose={() => setItemToConsume(null)}
                    onConsume={(itemId, quantity, userId) => consumeMutation.mutate({ itemId, quantity, userId })}
                    isPending={consumeMutation.isPending}
                />
            )}

            {/* Log Chore Modal */}
            {isLoggingChore && (
                <LogChoreModal
                    onClose={() => setIsLoggingChore(false)}
                    onLogChore={(type) => logChoreMutation.mutate(type)}
                    isPending={logChoreMutation.isPending}
                />
            )}
        </div>
    );
};

export default Dashboard;

import { useState } from 'react';
import type { Item, RoomMember } from '../types';
import { useAuthStore } from '../store/authStore';
import { X, User, Hash, Loader2 } from 'lucide-react';

interface ConsumeModalProps {
    item: Item;
    members: RoomMember[];
    onClose: () => void;
    onConsume: (itemId: string, quantity: number, userId?: string) => void;
    isPending: boolean;
}

const ConsumeModal = ({ item, members, onClose, onConsume, isPending }: ConsumeModalProps) => {
    const { user: currentUser } = useAuthStore();
    const [quantity, setQuantity] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity > 0 && quantity <= item.remaining_quantity) {
            onConsume(item.id, quantity, selectedUserId);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Consume {item.name}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-500 ml-1">How much was used?</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="number"
                                step="any"
                                min="0.01"
                                max={item.remaining_quantity}
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold text-lg"
                                placeholder="1"
                                autoFocus
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                {item.unit}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 ml-1">
                            Current stock: <span className="font-bold text-indigo-500">{item.remaining_quantity} {item.unit}</span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-500 ml-1">Who used it?</label>
                        <div className="grid grid-cols-2 gap-3">
                            {members.map((member) => (
                                <button
                                    key={member.user.id}
                                    type="button"
                                    onClick={() => setSelectedUserId(member.user.id)}
                                    className={`flex items-center space-x-2 p-3 rounded-2xl border-2 transition-all ${selectedUserId === member.user.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${selectedUserId === member.user.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-sm font-medium truncate ${selectedUserId === member.user.id ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {member.user.name === currentUser?.name ? 'Me' : member.user.name.split(' ')[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || quantity <= 0 || quantity > item.remaining_quantity}
                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Confirm</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsumeModal;

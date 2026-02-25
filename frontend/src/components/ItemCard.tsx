import { Plus, Minus, AlertTriangle, User, Calendar, Trash2 } from 'lucide-react';
import type { Item } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ItemCardProps {
    item: Item;
    onConsume: (itemId: string) => void;
    onRefill: (item: Item) => void;
    onDelete: (itemId: string) => void;
}

const ItemCard = ({ item, onConsume, onRefill, onDelete }: ItemCardProps) => {
    const percentage = (item.remaining_quantity / item.total_quantity) * 100;
    const isLowStock = percentage < 20 && item.remaining_quantity > 0;
    const isOutOfStock = item.remaining_quantity <= 0;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{item.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {item.remaining_quantity} / {item.total_quantity} {item.unit}
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    {isOutOfStock ? (
                        <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg uppercase">
                            Out of Stock
                        </span>
                    ) : isLowStock ? (
                        <span className="flex items-center px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg uppercase">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                        </span>
                    ) : null}

                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Item"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-500",
                            isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                    />
                </div>

                <div className="flex justify-between items-end">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs text-slate-400">
                            <User className="w-3 h-3 mr-1" />
                            <span>Added by {item.creator?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {(isLowStock || isOutOfStock) && (
                            <button
                                onClick={() => onRefill(item)}
                                title="Refill / Buy Again"
                                className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => onConsume(item.id)}
                            disabled={isOutOfStock}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            <Minus className="w-5 h-5 font-bold" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/20 transition-colors -z-0" />
        </div>
    );
};

export default ItemCard;

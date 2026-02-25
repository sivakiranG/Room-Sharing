import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useRoomStore } from '../store/roomStore';
import type { UsageSummaryEntry } from '../types';
import { BarChart3, User, RefreshCw } from 'lucide-react';

const Summary = () => {
    const { currentRoom } = useRoomStore();

    const { data: summary, isLoading } = useQuery<UsageSummaryEntry[]>({
        queryKey: ['summary', currentRoom?.id],
        queryFn: async () => {
            const { data } = await api.get(`/rooms/${currentRoom?.id}/summary`);
            return data;
        },
        enabled: !!currentRoom?.id,
    });

    if (!currentRoom) return null;

    // Group by user for better visualization
    const users = [...new Set(summary?.map(s => s.user_name) || [])];

    // Calculate item totals for percentage bars
    const itemTotals: Record<string, number> = {};
    summary?.forEach(s => {
        itemTotals[s.item_name] = (itemTotals[s.item_name] || 0) + s.total_consumed;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Consumption Summary</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Historical breakdown of who used how much.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : summary?.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem]">
                    <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500">Log some items to see analytics here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {users.map(userName => {
                        const userStats = summary?.filter(s => s.user_name === userName) || [];
                        return (
                            <div key={userName} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white">{userName}</h3>
                                </div>

                                <div className="space-y-5">
                                    {userStats.map(stat => {
                                        const totalForItem = itemTotals[stat.item_name] || 1;
                                        const percent = (stat.total_consumed / totalForItem) * 100;

                                        return (
                                            <div key={`${userName}-${stat.item_name}`} className="space-y-1.5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400 font-medium">{stat.item_name}</span>
                                                    <span className="text-slate-900 dark:text-white font-bold">{stat.total_consumed} {stat.unit}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-slate-400 text-right uppercase tracking-wider font-bold">
                                                    {Math.round(percent)}% of total room supply
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Summary;

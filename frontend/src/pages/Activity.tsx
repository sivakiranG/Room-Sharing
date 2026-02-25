import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useRoomStore } from '../store/roomStore';
import type { ActivityEntry } from '../types';
import { Clock, Package, AlertCircle } from 'lucide-react';

const Activity = () => {
    const { currentRoom } = useRoomStore();

    const { data: activities, isLoading } = useQuery<ActivityEntry[]>({
        queryKey: ['activity', currentRoom?.id],
        queryFn: async () => {
            const { data } = await api.get(`/rooms/${currentRoom?.id}/activity`);
            return data;
        },
        enabled: !!currentRoom?.id,
        refetchInterval: 10000, // Fallback poll every 10s if WS is down
    });

    if (!currentRoom) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Activity Feed</h1>
                <p className="text-slate-600 dark:text-slate-400 italic">See who's consuming what in real-time.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Clock className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : activities?.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <p>No activity yet. Every consumption log will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {activities?.map((activity) => (
                            <div key={`${activity.activity_type}-${activity.id}`} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start space-x-4">
                                <div className={`p-3 rounded-2xl flex-shrink-0 ${activity.activity_type === 'refill'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                                        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                                    }`}>
                                    <Package className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col">
                                        <p className="text-slate-900 dark:text-white font-medium">
                                            <span className="font-bold">{activity.user_name}</span>{' '}
                                            {activity.activity_type === 'refill' ? 'added/refilled' : 'consumed'}{' '}
                                            <span className={`${activity.activity_type === 'refill' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} font-bold`}>
                                                {activity.quantity} {activity.unit}
                                            </span>{' '}
                                            of <span className="font-bold">{activity.item_name}</span>
                                        </p>

                                        {activity.recorded_by_name && activity.recorded_by_name !== activity.user_name && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Recorded by <span className="font-semibold italic">{activity.recorded_by_name}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
                                        <div className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(activity.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl flex items-start space-x-3 border border-amber-100 dark:border-amber-900/10">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    Sharing is caring! Remember to log your consumption every time so your roommates know when it's time to restock.
                </p>
            </div>
        </div>
    );
};

export default Activity;

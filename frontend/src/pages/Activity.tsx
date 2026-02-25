import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useRoomStore } from '../store/roomStore';
import type { ActivityEntry } from '../types';
import { Clock, Package, AlertCircle, Sparkles, Filter } from 'lucide-react';

type FilterType = 'all' | 'consumption' | 'refill' | 'chore';

const Activity = () => {
    const { currentRoom } = useRoomStore();
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const { data: activities, isLoading } = useQuery<ActivityEntry[]>({
        queryKey: ['activity', currentRoom?.id],
        queryFn: async () => {
            const { data } = await api.get(`/rooms/${currentRoom?.id}/activity`);
            return data;
        },
        enabled: !!currentRoom?.id,
    });

    if (!currentRoom) return null;

    const filteredActivities = activities?.filter(a =>
        activeFilter === 'all' ? true : a.activity_type === activeFilter
    );

    const FilterChip = ({ type, label, icon: Icon }: { type: FilterType, label: string, icon?: any }) => (
        <button
            onClick={() => setActiveFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${activeFilter === type
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
                }`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Activity Feed</h1>
                    <p className="text-slate-600 dark:text-slate-400 italic">See everything happening in your room.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <FilterChip type="all" label="All" />
                    <FilterChip type="consumption" label="Usage" icon={Package} />
                    <FilterChip type="refill" label="Refills" icon={Clock} />
                    <FilterChip type="chore" label="Chores" icon={Sparkles} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Clock className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : filteredActivities?.length === 0 ? (
                    <div className="p-16 text-center text-slate-500">
                        <Filter className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                        <p className="font-medium text-lg">No {activeFilter === 'all' ? '' : activeFilter} activities found</p>
                        <p className="text-sm mt-1">Try switching filters or logging some actions!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {filteredActivities?.map((activity) => (
                            <div key={`${activity.activity_type}-${activity.id}`} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start space-x-4">
                                <div className={`p-3 rounded-2xl flex-shrink-0 ${activity.activity_type === 'refill'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                                    : activity.activity_type === 'chore'
                                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600'
                                        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                                    }`}>
                                    {activity.activity_type === 'chore' ? (
                                        <Sparkles className="w-5 h-5" />
                                    ) : (
                                        <Package className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col">
                                        <p className="text-slate-900 dark:text-white font-medium">
                                            <span className="font-bold">{activity.user_name}</span>{' '}
                                            {activity.activity_type === 'chore' ? (
                                                <>
                                                    completed <span className="text-purple-600 dark:text-purple-400 font-bold">{activity.chore_type}</span> on <span className="text-slate-500 dark:text-slate-400 font-normal">{new Date(activity.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                                </>
                                            ) : (
                                                <>
                                                    {activity.activity_type === 'refill' ? 'added/refilled' : 'consumed'}{' '}
                                                    <span className={`${activity.activity_type === 'refill' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} font-bold`}>
                                                        {activity.quantity} {activity.unit}
                                                    </span>{' '}
                                                    of <span className="font-bold">{activity.item_name}</span>
                                                </>
                                            )}
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
                    Sharing is caring! Filtering helps you find specific events, but remember that a clean and stocked room depends on everyone!
                </p>
            </div>
        </div>
    );
};

export default Activity;

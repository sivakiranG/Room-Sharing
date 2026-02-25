import { X, User, BarChart3, TrendingUp } from 'lucide-react';
import type { UsageSummaryEntry } from '../types';

interface UsageSummaryModalProps {
    itemName: string;
    summary: UsageSummaryEntry[];
    onClose: () => void;
}

const UsageSummaryModal = ({ itemName, summary, onClose }: UsageSummaryModalProps) => {
    const totalConsumed = summary.reduce((acc, curr) => acc + curr.total_consumed, 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white capitalize">{itemName} Usage</h2>
                        <p className="text-slate-500 text-sm mt-1">Total consumption history</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {summary.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No consumption data recorded yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl flex items-center justify-between border border-indigo-100 dark:border-indigo-900/10 mb-2">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Total Used</p>
                                        <p className="text-2xl font-black dark:text-white">
                                            {totalConsumed} <span className="text-sm font-medium text-slate-500">{summary[0]?.unit}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {summary.map((entry) => (
                                    <div
                                        key={entry.user_id}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{entry.user_name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                                {entry.total_consumed}
                                            </span>
                                            <span className="text-xs ml-1 text-slate-400 font-medium uppercase">{entry.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl active:scale-95 transition-all mt-4"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsageSummaryModal;

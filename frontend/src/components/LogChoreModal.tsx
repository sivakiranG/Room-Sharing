import { useState } from 'react';
import { X, CheckCircle2, Loader2, Sparkles, Home, Bath, Utensils } from 'lucide-react';

interface LogChoreModalProps {
    onClose: () => void;
    onLogChore: (choreType: string) => void;
    isPending: boolean;
}

const CHORE_OPTIONS = [
    { type: 'Kitchen Cleaning', icon: Utensils, color: 'bg-amber-500' },
    { type: 'Bathroom Cleaning', icon: Bath, color: 'bg-blue-500' },
    { type: 'Room Cleaning', icon: Home, color: 'bg-emerald-500' },
    { type: 'Common Area Cleaning', icon: Sparkles, color: 'bg-purple-500' },
];

const LogChoreModal = ({ onClose, onLogChore, isPending }: LogChoreModalProps) => {
    const [selectedType, setSelectedType] = useState(CHORE_OPTIONS[0].type);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogChore(selectedType);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Log Cleaning Activity</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                        {CHORE_OPTIONS.map((option) => (
                            <button
                                key={option.type}
                                type="button"
                                onClick={() => setSelectedType(option.type)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${selectedType === option.type
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${option.color} text-white shadow-lg shadow-${option.color}/20`}>
                                        <option.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-semibold ${selectedType === option.type ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {option.type}
                                    </span>
                                </div>
                                {selectedType === option.type && (
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                )}
                            </button>
                        ))}
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
                            disabled={isPending}
                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>I Cleaned This!</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogChoreModal;

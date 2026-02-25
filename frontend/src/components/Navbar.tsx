import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRoomStore } from '../store/roomStore';
import { LayoutDashboard, History, PieChart, LogOut, Moon, Sun, Sparkles } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { currentRoom, clearRoom, setIsLoggingChore } = useRoomStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return document.documentElement.classList.contains('dark');
    });

    const toggleDarkMode = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        logout();
        clearRoom();
        navigate('/auth');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Activity', path: '/activity', icon: History },
        { name: 'Summary', path: '/summary', icon: PieChart },
    ];

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                Bachelory Buddy
                            </span>
                        </Link>

                        <div className="hidden sm:flex items-center space-x-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === item.path
                                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </Link>
                            ))}

                            {currentRoom && (
                                <>
                                    <button
                                        onClick={() => setIsLoggingChore(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all active:scale-95 ml-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>Log Cleaning</span>
                                    </button>

                                    <div className="hidden lg:flex flex-col items-start pl-6 ml-4 border-l border-slate-200 dark:border-slate-800">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Room</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{currentRoom.name}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-slate-600 dark:text-slate-400 shadow-sm"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                        </button>

                        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center"
                                >
                                    <LogOut className="w-3 h-3 mr-1" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

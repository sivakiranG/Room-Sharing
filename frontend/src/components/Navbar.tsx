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
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDark(true);
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

                        <div className="hidden sm:flex space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.path
                                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {currentRoom && (
                            <div className="hidden md:block text-right mr-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Room</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentRoom.name}</p>
                            </div>
                        )}

                        {currentRoom && (
                            <button
                                onClick={() => setIsLoggingChore(true)}
                                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all active:scale-95"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Log Cleaning</span>
                            </button>
                        )}

                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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

import { LayoutDashboard, Wallet, PieChart, TrendingUp, Settings, Calendar } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';

const NAV_ITEMS = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Wallet },
    { label: 'Categories', path: '/categories', icon: PieChart },
    { label: 'Insights', path: '/insights', icon: TrendingUp },
    { label: 'Planning', path: '/planning', icon: Calendar },
    { label: 'Settings', path: '/settings', icon: Settings },
];

export function AppLayout() {
    const location = useLocation();

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-card/30 backdrop-blur-xl">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <img src="/src/assets/logo.png" alt="FinTrack Logo" className="w-8 h-8 rounded-lg" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            FinTrack
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Pro Tip</p>
                        <p className="text-sm text-foreground/80">Track every penny to save more!</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 glass sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <img src="/src/assets/logo.png" alt="FinTrack Logo" className="w-8 h-8 rounded-lg" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            FinTrack
                        </h1>
                    </div>
                    {/* Mobile Menu Trigger would go here */}
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">
                        <Outlet />
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-6 py-2 flex justify-between items-center z-50 pb-safe">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </main>
        </div>
    );
}

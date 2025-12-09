import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '../utils/cn';

export function Dashboard() {
    const { getBalance, getIncome, getExpense, transactions, categories, baseIncome } = useFinance();

    // Prepare chart data (last 7 days for example, or grouped by date)
    // For simplicity processing last few transactions
    const data = transactions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(t => ({
            date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            amount: t.type === 'income' ? t.amount : -t.amount,
            value: t.amount // Absolute value for other visualizations if needed
        }));

    // Calculate running balance for the chart
    let runningBalance = 0;
    const chartData = data.map(item => {
        runningBalance += item.amount;
        return { ...item, balance: runningBalance };
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1"> Overview of your financial health.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent transition-opacity group-hover:from-blue-500/20" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(getBalance())}</div>
                        <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent transition-opacity group-hover:from-emerald-500/20" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{formatCurrency(getIncome())}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-500" />
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent transition-opacity group-hover:from-red-500/20" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{formatCurrency(getExpense())}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
                            -4% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Balance History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value}`} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => [formatCurrency(value), 'Balance']}
                                        />
                                        <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                                    <p>No transaction data available yet.</p>
                                    <p className="text-sm">Add some transactions to see your history!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 5)
                                .map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                                                t.type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                                            )}>
                                                {t.type === 'income' ? '+' : '-'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{t.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "font-bold",
                                            t.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                                        )}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </div>
                                    </div>
                                ))}
                            {transactions.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent transactions.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Overview Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        Budget Overview (This Month)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {categories
                            .filter(c => c.type === 'expense')
                            .map(cat => {
                                const income = Number(baseIncome || 0);
                                const limit = Number(cat.budgetLimit || 0);
                                const allocated = cat.budgetType === 'percentage' && income > 0
                                    ? (income * (limit / 100))
                                    : limit;

                                // Calculate spent this month
                                const currentMonth = new Date().getMonth();
                                const currentYear = new Date().getFullYear();
                                const spent = transactions
                                    .filter(t => {
                                        const d = new Date(t.date);
                                        return t.category === cat.name &&
                                            t.type === 'expense' &&
                                            d.getMonth() === currentMonth &&
                                            d.getFullYear() === currentYear;
                                    })
                                    .reduce((acc, t) => acc + t.amount, 0);

                                const percentage = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
                                const isOverBudget = spent > allocated;

                                return (
                                    <div key={cat.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                <span className="font-medium">{cat.name}</span>
                                            </div>
                                            <div className={cn("text-xs font-bold px-2 py-1 rounded-full", isOverBudget ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                                                {percentage.toFixed(0)}%
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Spent</span>
                                                <span className={cn(isOverBudget ? "text-red-400" : "text-white")}>{formatCurrency(spent)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Limit</span>
                                                <span className="text-white">{formatCurrency(allocated)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-500", isOverBudget ? "bg-red-500" : "bg-blue-500")}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        {categories.filter(c => c.type === 'expense').length === 0 && (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                No expense categories found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

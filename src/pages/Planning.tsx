import { useFinance, type Category } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Wallet, PieChart as PieIcon, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../utils/cn';

export function Planning() {
    const { baseIncome, setBaseIncome, categories, updateCategory, transactions } = useFinance();
    const expenseCategories = categories.filter(c => c.type === 'expense');

    // Calculate spending for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const categorySpending = transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    // Safe calculations
    const income = Number(baseIncome) || 0;

    const totalAllocated = expenseCategories.reduce((acc, cat) => {
        const limit = Number(cat.budgetLimit) || 0;
        if (cat.budgetType === 'percentage' && income > 0) {
            return acc + (income * (limit / 100));
        }
        return acc + limit;
    }, 0);

    const remainingBudget = Math.max(0, income - totalAllocated);
    const isOverBudget = totalAllocated > income;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const handlePercentageChange = (cat: Category, percentage: string) => {
        updateCategory(cat.id, {
            budgetType: 'percentage',
            budgetLimit: Number(percentage)
        });
    };

    const chartData = [
        ...expenseCategories.map(cat => {
            const limit = Number(cat.budgetLimit) || 0;
            return {
                name: cat.name,
                value: cat.budgetType === 'percentage' && income > 0
                    ? (income * (limit / 100))
                    : limit,
                color: cat.color || '#cbd5e1'
            };
        }).filter(d => d.value > 0),
        { name: 'Remaining', value: remainingBudget, color: '#334155' }
    ].filter(d => d.value > 0);

    // Guard against empty chart
    const showChart = chartData.length > 0 && chartData.some(d => d.value > 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Budget Planning</h2>
                <p className="text-muted-foreground mt-1">Allocate your monthly income effectively.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Income Base */}
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-400">
                                <Wallet className="w-5 h-5" />
                                Total Monthly Income
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        value={income || ''}
                                        onChange={e => setBaseIncome(Number(e.target.value))}
                                        placeholder="Enter total income..."
                                        className="text-2xl font-bold h-14 bg-black/20 border-emerald-500/30 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-emerald-400/70 mt-2">
                                *This amount is the foundation for your percentage-based budgets.
                            </p>
                        </CardContent>
                    </Card>

                    {/* 2. Category Allocations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Allocation ({expenseCategories.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {expenseCategories.map(cat => (
                                <div key={cat.id} className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}` }} />
                                            <span className="font-bold text-lg">{cat.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-muted-foreground">Allocated Amount</div>
                                            <div className="font-mono text-emerald-400">
                                                {formatCurrency(cat.budgetType === 'percentage' && income > 0
                                                    ? (income * ((Number(cat.budgetLimit) || 0) / 100))
                                                    : (Number(cat.budgetLimit) || 0)
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-muted-foreground mb-1 block">Allocation %</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={cat.budgetType === 'percentage' ? (Number(cat.budgetLimit) || 0) : 0}
                                                    onChange={(e) => handlePercentageChange(cat, e.target.value)}
                                                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                                                    disabled={income === 0}
                                                />
                                                <div className="w-16 relative">
                                                    <Input
                                                        type="number"
                                                        value={cat.budgetType === 'percentage' ? (cat.budgetLimit || '') : ''}
                                                        onChange={(e) => handlePercentageChange(cat, e.target.value)}
                                                        className="h-8 text-center px-1"
                                                        disabled={income === 0}
                                                    />
                                                    <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {income === 0 && (
                                        <p className="text-xs text-yellow-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Set Total Monthly Income first
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Visualization */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieIcon className="w-5 h-5 text-blue-400" />
                                Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Pie Chart */}
                            <div className="h-[250px] w-full relative flex items-center justify-center">
                                {showChart ? (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: number) => formatCurrency(value)}
                                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-xs text-muted-foreground">Total Budget</span>
                                            <span className="font-bold text-lg">{formatCurrency(totalAllocated)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-muted-foreground text-sm">
                                        No budget data to display.<br />Start allocating money to see charts.
                                    </div>
                                )}
                            </div>

                            {/* Summary Stats */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Income</span>
                                    <span className="font-medium">{formatCurrency(income)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Allocated</span>
                                    <span className="font-medium text-red-400">-{formatCurrency(totalAllocated)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="font-medium text-emerald-400">Remaining</span>
                                    <span className={cn("font-bold text-lg", remainingBudget < 0 ? "text-red-500" : "text-emerald-400")}>
                                        {formatCurrency(remainingBudget)}
                                    </span>
                                </div>
                            </div>

                            {isOverBudget && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>You have allocated more than your total income! Please adjust your budgets.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

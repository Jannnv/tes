import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import { cn } from '../utils/cn';

export function Insights() {
    const { transactions, getBalance, getIncome, getExpense } = useFinance();
    const [projectionMonths, setProjectionMonths] = useState(6);
    const [monthlyBudgetInput, setMonthlyBudgetInput] = useState('');

    const currentBalance = getBalance();

    // Calculate historical trends
    const stats = useMemo(() => {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthTransactions = transactions.filter(t => new Date(t.date) >= oneMonthAgo);
        const lastMonthExpense = lastMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // If no data, assume some defaults or 0
        const avgMonthlyExpense = lastMonthExpense || 0;

        return { avgMonthlyExpense };
    }, [transactions]);

    const projectedData = useMemo(() => {
        const data = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Scenario 1: Continue as represents (Current Trend)
        // Scenario 2: Budgeted (User Input or 80% of current)
        const budgetExpense = monthlyBudgetInput ? Number(monthlyBudgetInput) : stats.avgMonthlyExpense * 0.9; // Default suggestion: cut 10%

        // Estimate monthly income (simple average from total for now, or last month)
        // For simplicity, let's assume average monthly income is stable based on total income / months active (approx)
        // A better way is to filter last month's income
        const lastMonthIncome = transactions
            .filter(t => {
                const d = new Date(t.date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0) || 0;

        let trendBalance = currentBalance;
        let budgetBalance = currentBalance;

        for (let i = 0; i <= projectionMonths; i++) {
            const date = new Date(currentYear, currentMonth + i, 1);

            data.push({
                month: date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
                Trend: trendBalance,
                Optimized: budgetBalance,
            });

            // Apply monthly changes for next iteration
            trendBalance += (lastMonthIncome - stats.avgMonthlyExpense);
            budgetBalance += (lastMonthIncome - budgetExpense);
        }
        return data;
    }, [currentBalance, stats.avgMonthlyExpense, projectionMonths, monthlyBudgetInput, transactions]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    // Evaluation Logic
    const topExpenses = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const byCategory: Record<string, number> = {};
        expenses.forEach(t => {
            byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        });
        return Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
    }, [transactions]);

    const advice = useMemo(() => {
        const list = [];
        const totalIncome = getIncome();
        const totalExpense = getExpense();
        const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;

        if (savingsRate < 0.1) {
            list.push({
                title: "Low Savings Rate",
                text: "You're saving less than 10% of your income. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
                icon: AlertTriangle,
                color: "text-red-500"
            });
        } else if (savingsRate > 0.4) {
            list.push({
                title: "Great Saver!",
                text: "Your savings rate is excellent. Consider investing the surplus for long-term growth.",
                icon: TrendingUp,
                color: "text-emerald-500"
            });
        }

        if (topExpenses.length > 0) {
            list.push({
                title: `Watch your ${topExpenses[0][0]}`,
                text: `${topExpenses[0][0]} is your biggest expense. Setting a strict budget here yields the biggest impact.`,
                icon: Target,
                color: "text-blue-500"
            });
        }

        return list;
    }, [getIncome, getExpense, topExpenses]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Financial Insights</h2>
                <p className="text-muted-foreground mt-1">AI-powered predictions and evaluations for your future.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Forecasting Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Future Balance Projection
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-3 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Projection Period (Months)</label>
                                <input
                                    type="range"
                                    min="3"
                                    max="24"
                                    value={projectionMonths}
                                    onChange={e => setProjectionMonths(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-right text-sm text-primary font-bold">{projectionMonths} Months</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Target Monthly Expense (Rp)</label>
                                <Input
                                    type="number"
                                    placeholder={`Avg: ${stats.avgMonthlyExpense.toLocaleString()}`}
                                    value={monthlyBudgetInput}
                                    onChange={e => setMonthlyBudgetInput(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <div className="text-sm text-muted-foreground">
                                    Current Avg Expense: <span className="text-white font-bold">{formatCurrency(stats.avgMonthlyExpense)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={projectedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}M`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                                        formatter={(val: number) => [formatCurrency(val)]}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="Trend" stroke="#ef4444" strokeWidth={2} dot={false} name="Current Trend" />
                                    <Line type="monotone" dataKey="Optimized" stroke="#10b981" strokeWidth={2} dot={false} name="With Target Budget" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Evaluation Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            Top Expenses Evaluation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topExpenses.map(([category, amount], idx) => (
                                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                            idx === 0 ? "bg-red-500/20 text-red-500" : "bg-white/10 text-muted-foreground"
                                        )}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium">{category}</span>
                                    </div>
                                    <span className="font-bold">{formatCurrency(amount)}</span>
                                </div>
                            ))}
                            {topExpenses.length === 0 && <p className="text-muted-foreground">Not enough data to evaluate.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Smart Advice Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Smart Advice
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {advice.length > 0 ? advice.map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                                    <item.icon className={cn("w-6 h-6 shrink-0", item.color)} />
                                    <div>
                                        <h4 className={cn("font-bold text-sm mb-1", item.color)}>{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">{item.text}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-6 text-muted-foreground">
                                    <p>Start adding transactions to get personalized advice!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

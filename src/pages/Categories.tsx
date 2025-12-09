import { useState } from 'react';
import { useFinance, type TransactionType } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

export function Categories() {
    const { categories, addCategory, deleteCategory } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'expense' as TransactionType,
        color: '#3b82f6',
        budgetLimit: '',
        budgetType: 'fixed' as 'fixed' | 'percentage',
    });

    const { baseIncome } = useFinance(); // Grab baseIncome to calculate preview

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        addCategory({
            name: formData.name,
            type: formData.type,
            color: formData.color,
            budgetLimit: formData.budgetLimit ? Number(formData.budgetLimit) : 0,
            budgetType: formData.budgetType,
        });

        setIsModalOpen(false);
        setFormData({
            name: '',
            type: 'expense',
            color: '#3b82f6',
            budgetLimit: '',
            budgetType: 'fixed',
        });
    };

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    // Calculate spending per category
    const categorySpending = useFinance().transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                    <p className="text-muted-foreground mt-1">Manage transaction categories.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-emerald-500">Income Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {incomeCategories.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <button
                                        onClick={() => deleteCategory(item.id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {incomeCategories.length === 0 && (
                                <p className="text-sm text-muted-foreground py-4">No income categories.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-500">Expense Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {expenseCategories.map(item => (
                                <div key={item.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteCategory(item.id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                </div>
                            ))}
                            {expenseCategories.length === 0 && (
                                <p className="text-sm text-muted-foreground py-4">No expense categories.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Category"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={cn(
                                "cursor-pointer p-4 rounded-xl border-2 text-center transition-all",
                                formData.type === 'expense' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-transparent bg-white/5 hover:bg-white/10'
                            )}
                            onClick={() => setFormData(p => ({ ...p, type: 'expense' }))}
                        >
                            Expense
                        </div>
                        <div
                            className={cn(
                                "cursor-pointer p-4 rounded-xl border-2 text-center transition-all",
                                formData.type === 'income' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-transparent bg-white/5 hover:bg-white/10'
                            )}
                            onClick={() => setFormData(p => ({ ...p, type: 'income' }))}
                        >
                            Income
                        </div>
                    </div>

                    <Input
                        label="Category Name"
                        placeholder="e.g. Shopping, Salary..."
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        required
                        autoFocus
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Color Tag</label>
                        <div className="flex gap-2 flex-wrap">
                            {['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, color }))}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                        formData.color === color ? "border-white scale-110" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                        <label className="text-sm font-medium">Budget Settings</label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, budgetType: 'fixed', budgetLimit: '' }))}
                                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-colors", formData.budgetType === 'fixed' ? "bg-white text-black" : "bg-black/20 text-muted-foreground")}
                            >
                                Fixed Amount (Rp)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, budgetType: 'percentage', budgetLimit: '' }))}
                                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-colors", formData.budgetType === 'percentage' ? "bg-white text-black" : "bg-black/20 text-muted-foreground")}
                            >
                                Percentage (%)
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                label={formData.budgetType === 'percentage' ? "Percentage of Monthly Income" : "Budget Limit (Rp)"}
                                type="number"
                                placeholder={formData.budgetType === 'percentage' ? "e.g. 50" : "Optional"}
                                value={formData.budgetLimit}
                                onChange={e => setFormData(p => ({ ...p, budgetLimit: e.target.value }))}
                            />
                            {formData.budgetType === 'percentage' && formData.budgetLimit && baseIncome > 0 && (
                                <div className="text-xs text-right mt-1 text-emerald-400">
                                    ≈ {formatCurrency((Number(formData.budgetLimit) / 100) * baseIncome)}
                                </div>
                            )}
                            {formData.budgetType === 'percentage' && baseIncome === 0 && (
                                <div className="text-xs text-right mt-1 text-yellow-400">
                                    Set Base Income in Planning to see value
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Category
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

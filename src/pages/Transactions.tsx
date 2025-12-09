import React, { useState } from 'react';
import { useFinance, type TransactionType } from '../context/FinanceContext';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Plus, Trash2, Search, Filter, Pencil } from 'lucide-react';
import { cn } from '../utils/cn';

export function Transactions() {
    const { transactions, addTransaction, editTransaction, deleteTransaction, categories } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        type: 'expense' as TransactionType,
        date: new Date().toISOString().split('T')[0],
    });

    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            amount: '',
            description: '',
            category: '',
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || !formData.description || !formData.category) return;

        const transactionData = {
            amount: Number(formData.amount),
            description: formData.description,
            category: formData.category,
            type: formData.type,
            date: formData.date,
        };

        if (editingId) {
            editTransaction(editingId, transactionData);
        } else {
            addTransaction(transactionData);
        }

        handleCloseModal();
    };

    const handleEdit = (transaction: any) => {
        setFormData({
            amount: transaction.amount.toString(),
            description: transaction.description,
            category: transaction.category,
            type: transaction.type,
            date: transaction.date,
        });
        setEditingId(transaction.id);
        setIsModalOpen(true);
    };

    const categoryOptions = categories
        .filter(c => c.type === formData.type)
        .map(c => ({ label: c.name, value: c.name }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground mt-1">Manage and track your financial records.</p>
                </div>
                <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-background/50 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <div className="flex p-1 bg-background/50 rounded-xl border border-input">
                                <button
                                    onClick={() => setTypeFilter('all')}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", typeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-white/5')}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setTypeFilter('income')}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", typeFilter === 'income' ? 'bg-emerald-500 text-white' : 'text-muted-foreground hover:bg-white/5')}
                                >
                                    Income
                                </button>
                                <button
                                    onClick={() => setTypeFilter('expense')}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", typeFilter === 'expense' ? 'bg-red-500 text-white' : 'text-muted-foreground hover:bg-white/5')}
                                >
                                    Expense
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Description</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTransactions.map((t) => (
                                    <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{t.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-bold whitespace-nowrap",
                                            t.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                                        )}>
                                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors mr-2 opacity-0 group-hover:opacity-100"
                                                title="Edit transaction"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteTransaction(t.id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete transaction"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Transaction" : "Add Transaction"}
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
                        label="Amount (Rp)"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 50000"
                        value={formData.amount}
                        onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                        required
                        autoFocus
                    />

                    <Input
                        label="Description"
                        placeholder="Example: Groceries, Freelance..."
                        value={formData.description}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        required
                    />

                    <Select
                        label="Category"
                        options={[{ label: 'Select Category', value: '' }, ...categoryOptions]}
                        value={formData.category}
                        onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                        required
                    />

                    <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingId ? "Update" : "Save"} Transaction
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

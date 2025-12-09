import React, { createContext, useContext, useEffect, useState } from 'react';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string; // ISO date string
    description: string;
}

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    color: string;
    icon?: string;
    budgetLimit?: number;
    budgetType?: 'fixed' | 'percentage'; // New field
}

interface FinanceContextType {
    transactions: Transaction[];
    categories: Category[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    editTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, category: Partial<Omit<Category, 'id'>>) => void;
    deleteCategory: (id: string) => void;
    getBalance: () => number;
    getIncome: () => number;
    getExpense: () => number;
    baseIncome: number;
    setBaseIncome: (amount: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: 'Investments', type: 'income', color: '#10B981', icon: 'timelapse' },
    { id: '2', name: 'Freelance', type: 'income', color: '#3B82F6', icon: 'briefcase' },
    { id: '3', name: 'Food', type: 'expense', color: '#F59E0B', icon: 'utensils', budgetLimit: 0 },
    { id: '4', name: 'Rent', type: 'expense', color: '#EF4444', icon: 'home', budgetLimit: 0 },
    { id: '5', name: 'Transport', type: 'expense', color: '#8B5CF6', icon: 'car', budgetLimit: 0 },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [categories, setCategories] = useState<Category[]>(() => {
        try {
            const saved = localStorage.getItem('categories');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
        } catch {
            return DEFAULT_CATEGORIES;
        }
    });

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    const [baseIncome, setBaseIncome] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('baseIncome');
            const num = saved ? Number(saved) : 0;
            return isNaN(num) ? 0 : num;
        } catch {
            return 0;
        }
    });

    useEffect(() => {
        localStorage.setItem('baseIncome', baseIncome.toString());
    }, [baseIncome]);

    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = {
            ...transaction,
            id: crypto.randomUUID(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };

    const editTransaction = (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
        setTransactions((prev) => prev.map((t) => (t.id === id ? { ...updatedTransaction, id } : t)));
    };

    const deleteTransaction = (id: string) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    const addCategory = (category: Omit<Category, 'id'>) => {
        const newCategory = {
            ...category,
            id: crypto.randomUUID(),
        };
        setCategories((prev) => [...prev, newCategory]);
    };

    const updateCategory = (id: string, updatedCategory: Partial<Omit<Category, 'id'>>) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedCategory } : c)));
    };

    const deleteCategory = (id: string) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    const getIncome = () => {
        return transactions
            .filter((t) => t.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);
    };

    const getExpense = () => {
        return transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);
    };

    const getBalance = () => {
        return getIncome() - getExpense();
    };

    return (
        <FinanceContext.Provider
            value={{
                transactions,
                categories,
                addTransaction,
                editTransaction,
                deleteTransaction,
                addCategory,
                updateCategory,
                deleteCategory,
                getBalance,
                getIncome,
                getExpense,
                baseIncome,
                setBaseIncome,
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}

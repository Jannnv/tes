import { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Download, Upload, AlertTriangle, Check, Trash2 } from 'lucide-react';

export function Settings() {
    // Need to access raw setters if we want to replace state, 
    // but context currently only exposes specialized add/delete methods.
    // For a local app, we can just manipulate localStorage and reload context or page.
    const { transactions, categories } = useFinance();
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            transactions,
            categories,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fintrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                // Validate basic structure
                if (!Array.isArray(json.transactions) || !Array.isArray(json.categories)) {
                    throw new Error("Invalid file format");
                }

                if (confirm("WARNING: importing data will OVERWRITE your current data. This cannot be undone. Are you sure?")) {
                    localStorage.setItem('transactions', JSON.stringify(json.transactions));
                    localStorage.setItem('categories', JSON.stringify(json.categories));
                    setImportStatus('success');
                    // Force reload to update context (simplest way for now)
                    window.location.reload();
                }
            } catch (err) {
                console.error(err);
                setImportStatus('error');
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (confirm("DANGER: This will delete ALL your transactions and categories. This action is IRREVERSIBLE. Proceed?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your data and application preferences.</p>
            </div>

            <div className="grid gap-6">


                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-500" />
                            Data Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Export your data to a JSON file. Use this to backup your transactions or transfer them to another device.
                        </p>
                        <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-emerald-500" />
                            Import Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Restore data from a backup file. <span className="text-red-400 font-bold">Warning: This will replace your current data.</span>
                        </p>

                        <div className="flex items-center gap-4">
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full sm:w-auto">
                                <Upload className="w-4 h-4 mr-2" />
                                Select Backup File
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                            />

                            {importStatus === 'success' && <span className="text-emerald-500 flex items-center gap-1 text-sm"><Check className="w-4 h-4" /> Import Successful!</span>}
                            {importStatus === 'error' && <span className="text-red-500 flex items-center gap-1 text-sm"><AlertTriangle className="w-4 h-4" /> Invalid File</span>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-red-300">
                            Clear all application data. This action cannot be undone.
                        </p>
                        <Button onClick={handleClearData} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-none">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Reset All Data
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

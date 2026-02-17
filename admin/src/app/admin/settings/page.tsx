'use client';

import Sidebar from '../../../components/Sidebar';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar />

            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-slate-400 mt-1">Platform configuration</p>
                    </div>
                </header>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                    <p>Settings panel coming soon...</p>
                </div>
            </main>
        </div>
    );
}

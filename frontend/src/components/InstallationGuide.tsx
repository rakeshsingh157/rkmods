'use client';

import { useState } from 'react';
import { Download, Package, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function InstallationGuide({ appName }: { appName: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="animate-fadeIn [animation-delay:0.18s]">
            <div 
                className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-2xl border border-blue-500/20 overflow-hidden cursor-pointer hover:border-blue-500/40 transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Installation Guide
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">Step-by-step instructions</p>
                        </div>
                    </div>
                    {isOpen ? (
                        <ChevronUp className="w-6 h-6 text-blue-400" />
                    ) : (
                        <ChevronDown className="w-6 h-6 text-blue-400" />
                    )}
                </div>

                {isOpen && (
                    <div className="px-6 pb-6 space-y-4 animate-fadeIn">
                        <div className="flex gap-4 items-start p-4 bg-[#131b2e] rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                <span className="text-cyan-400 font-bold text-sm">1</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                    Download the MOD file
                                    <Download className="w-4 h-4 text-cyan-400" />
                                </h3>
                                <p className="text-sm text-gray-400">Click the download button above to get the {appName} MOD APK file.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start p-4 bg-[#131b2e] rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                <span className="text-cyan-400 font-bold text-sm">2</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-2">Enable Unknown Sources</h3>
                                <p className="text-sm text-gray-400">Go to Settings → Security → Enable "Unknown Sources" to allow installation from third-party sources.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start p-4 bg-[#131b2e] rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                <span className="text-cyan-400 font-bold text-sm">3</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-2">Uninstall Original App (if any)</h3>
                                <p className="text-sm text-gray-400">Remove the original version of the app before installing the MOD to avoid conflicts.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start p-4 bg-[#131b2e] rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                <span className="text-cyan-400 font-bold text-sm">4</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-2">Install & Launch</h3>
                                <p className="text-sm text-gray-400">Locate the downloaded APK file and tap to install. Once installed, open the app and enjoy!</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-yellow-400 text-sm mb-1">Important Notice</h4>
                                <p className="text-xs text-gray-400">Always download from trusted sources. Disable antivirus temporarily if installation is blocked. Make sure you have enough storage space.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

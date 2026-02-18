import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#0b0f19] border-t border-white/5 py-8">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Are you a developer? <a href="https://rkmods-developer.vercel.app" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-semibold hover:underline">Publish your app</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

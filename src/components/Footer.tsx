import Link from 'next/link';
import { Github, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 inline-block">
                            AppStore
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The best place to discover and download amazing apps. Safe, fast, and secure.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Discover</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/" className="hover:text-blue-600 transition">Home</Link></li>
                            <li><Link href="/trending" className="hover:text-blue-600 transition">Trending Apps</Link></li>
                            <li><Link href="/categories" className="hover:text-blue-600 transition">Categories</Link></li>
                            <li><Link href="/search?q=" className="hover:text-blue-600 transition">Search</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#" className="hover:text-blue-600 transition">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-blue-600 transition">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-blue-600 transition">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-800 hover:text-white transition">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} AppStore. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

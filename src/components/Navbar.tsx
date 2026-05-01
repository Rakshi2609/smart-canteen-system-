import Link from 'next/link';
import { Map, LayoutDashboard, Utensils } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Utensils className="text-primary" />
          <span>SmartCanteen</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/map" className="flex items-center gap-2 text-lg font-bold text-slate-300 hover:text-white transition-colors">
            <Map size={22} />
            <span>Live Map</span>
          </Link>
          <Link href="/support" className="flex items-center gap-2 text-lg font-bold text-pink-400 hover:text-pink-300 transition-colors bg-pink-500/10 px-4 py-2 rounded-xl">
            <span>Support ❤️</span>
          </Link>
          <Link href="/admin" className="flex items-center gap-2 text-lg font-bold text-slate-300 hover:text-white transition-colors">
            <LayoutDashboard size={22} />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

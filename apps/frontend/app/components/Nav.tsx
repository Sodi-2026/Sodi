'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, Settings, LayoutPanelLeft, LayoutDashboard, Database, Ruler } from 'lucide-react';

export default function Nav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/insumos', label: '1. Insumos Básicos', icon: Database, bg: 'bg-emerald-50 text-emerald-700', active: 'bg-emerald-600 text-white shadow-md' },
    { href: '/admin/engenharia', label: '2. Eng. (Janelas)', icon: Ruler, bg: 'bg-indigo-50 text-indigo-700', active: 'bg-indigo-600 text-white shadow-md' },
    { href: '/', label: '3. Simulador Final', icon: Calculator, bg: 'bg-blue-50 text-blue-700', active: 'bg-blue-600 text-white shadow-md' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center h-auto md:h-20 py-4 md:py-0">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center shadow">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                SODAY<span className="text-gray-400 font-light">Pro</span>
              </h1>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Passo a Passo Guiado</p>
            </div>
          </div>
          
          {/* Steps */}
          <div className="flex overflow-x-auto space-x-2 pb-2 md:pb-0">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isPast = navItems.findIndex(n => n.href === pathname) > idx;

              return (
                <div key={item.href} className="flex items-center">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                      ${isActive ? item.active : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}
                      ${isPast && !isActive ? 'border-green-300 bg-green-50 text-green-700' : ''}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                  {idx < navItems.length - 1 && (
                    <div className="hidden md:block w-4 h-[1px] bg-gray-300 mx-2"></div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </nav>
  );
}

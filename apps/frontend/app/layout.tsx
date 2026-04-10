import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from './components/Nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SODAY Esquadrias Padrão',
  description: 'Sistema guiado',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`}>
        <div className="flex flex-col min-h-screen z-10 bg-gray-50/50">
          <Nav />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full mt-4 bg-white shadow-xl rounded-t-3xl border border-gray-200">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

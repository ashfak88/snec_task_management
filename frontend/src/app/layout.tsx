import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SNEC Task Management',
  description: 'Task and Project Management System for SNEC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-gray-50 text-gray-900 antialiased flex flex-col`}>
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold text-blue-600">SNEC Task Manager</h1>
          </div>
        </header>
        
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
          {children}
        </main>
        
        <footer className="bg-white border-t border-gray-200 mt-auto p-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Samastha National Education Council
        </footer>
      </body>
    </html>
  );
}

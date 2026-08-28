'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <div className="bg-olive-50 p-6 rounded-full mb-6 text-olive-600 shadow-sm border border-olive-100">
          <FileQuestion className="w-20 h-20" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
          404 - Page Not Found
        </h1>

        <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
          We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the project details page hasn't been built yet!
        </p>

        <div className="flex gap-4">
          <Link href="/projects">
            <Button variant="outline" className="border-olive-600 text-olive-700 hover:bg-olive-50 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-olive-700 hover:bg-olive-800 text-white">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

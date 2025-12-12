'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Waitlist Section Component
 * Email signup form for waitlist
 */
export function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setStatus('loading');

    try {
      // TODO: Replace with your actual API endpoint
      // This could be a Supabase Edge Function, API route, or any backend
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      setStatus('success');
      setMessage('You\'re on the list! We\'ll be in touch soon.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="waitlist" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        {/* Section Header */}
        <div className="mb-10">
          <span className="text-4xl mb-4 block">📧</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Join the Waitlist
          </h2>
          <p className="text-lg text-gray-600">
            Be the first to know when we launch new features. Get early access
            and exclusive updates delivered to your inbox.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              disabled={status === 'loading'}
              required
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Join</span>
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}
        </form>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            No spam, ever
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Unsubscribe anytime
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Free forever
          </span>
        </div>
      </div>
    </section>
  );
}

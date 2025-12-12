import Link from 'next/link';
import { Download, Smartphone } from 'lucide-react';

/**
 * Hero Section Component
 * Main landing section with CTA
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-8">
            <span className="mr-2">🚀</span>
            Now available on iOS & Android
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The App That{' '}
            <span className="text-primary-600">Changes Everything</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Arc is the all-in-one solution that helps you accomplish more,
            stress less, and achieve your goals faster than ever before.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="#download"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Now
            </Link>
            <Link
              href="#features"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-primary-300 hover:text-primary-600 transition"
            >
              Learn More
            </Link>
          </div>

          {/* App Store Buttons */}
          <div id="download" className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://apps.apple.com/app/id123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:scale-105"
            >
              <img
                src="/app-store-badge.svg"
                alt="Download on the App Store"
                className="h-14"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.yourcompany.arc"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:scale-105"
            >
              <img
                src="/google-play-badge.svg"
                alt="Get it on Google Play"
                className="h-14"
              />
            </a>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-lg">
            {/* Phone frame placeholder */}
            <div className="relative mx-auto w-64 h-[520px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-[32px] flex items-center justify-center">
                <div className="text-center">
                  <Smartphone className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                  <p className="text-primary-600 font-medium">
                    App Screenshot
                  </p>
                  <p className="text-primary-500 text-sm mt-1">
                    Replace with your screenshot
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Arc - Your App Description',
  description: 'Arc is an amazing app that helps you do amazing things. Download on iOS and Android.',
  keywords: ['app', 'mobile', 'iOS', 'Android', 'Arc'],
  authors: [{ name: 'Your Company' }],
  openGraph: {
    title: 'Arc - Your App Description',
    description: 'Arc is an amazing app that helps you do amazing things.',
    url: 'https://yourapp.com',
    siteName: 'Arc',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Arc App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arc - Your App Description',
    description: 'Arc is an amazing app that helps you do amazing things.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

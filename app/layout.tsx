import './globals.css';
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AuthProvider } from './context/auth';

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'FreyaAI: Advanced Emotion-Driven Music Experience',
  description: 'Let your feelings guide you to the perfect melody. Experience music that resonates with your soul.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-manrope bg-white text-gray-900 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
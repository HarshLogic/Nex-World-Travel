import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const metadata = {
  metadataBase: new URL('https://nexworldtravel.com'),
  title: 'Nex World Travel & Tourism | Premium Next-Gen Travel Booking & Tours',
  description:
    'Experience extraordinary global travel with Nex World Travel & Tourism, Abu Dhabi. Customized vacation packages, luxury cruises, adventures, and personalized itineraries across Asia, Europe, Africa, Australia, and UAE.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/app-icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/images/app-icon.png',
  },
  keywords: [
    'Nex World Travel',
    'Nex World Travel and Tourism',
    'Travel Agency Abu Dhabi',
    'Custom Vacation Packages',
    'Luxury Cruises',
    'Desert Safari UAE',
    'Club Nexa',
  ],
  authors: [{ name: 'Nex World Travel & Tourism' }],
  openGraph: {
    title: 'Nex World Travel & Tourism | Next-Gen Travel Experiences',
    description:
      'Curated holidays, bespoke itineraries, and global travel adventures from Abu Dhabi to the world.',
    url: 'https://nexworldtravel.com',
    siteName: 'Nex World Travel & Tourism',
    images: [
      {
        url: '/images/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Nex World Travel & Tourism - World Horizons',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-text-primary antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}


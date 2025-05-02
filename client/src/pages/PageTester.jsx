import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PageTester = () => {
  const pagesToTest = [
    { name: 'Playlists', path: '/playlists', description: 'Manage your playlists' },
    { name: 'Downloads', path: '/downloads', description: 'View your downloaded videos' },
    { name: 'Your Clips', path: '/your-clips', description: 'Manage your video clips' },
    { name: 'Settings', path: '/settings', description: 'Manage your account settings' },
    { name: 'Report History', path: '/report-history', description: 'View your content reports' },
    { name: 'Help', path: '/help', description: 'Get help with platform features' },
    { name: 'Feedback', path: '/feedback', description: 'Send feedback about the platform' },
    { name: 'Payment Success', path: '/payment/success', description: 'Payment success page' },
    { name: 'Payment Error', path: '/payment/error', description: 'Payment error page' },
    { name: 'Payment History', path: '/payment/history', description: 'View your payment history' }
  ];

  const paymentComponents = [
    { name: 'Donation Modal', description: 'Modal for donating to creators' },
    { name: 'Premium Subscription Modal', description: 'Modal for subscribing to premium' },
    { name: 'Channel Subscription Modal', description: 'Modal for subscribing to channels' },
    { name: 'Ad Credit Purchase Modal', description: 'Modal for purchasing ad credits' }
  ];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Page Tester</h1>
        <p className="text-gray-300 mb-8">
          Use this page to test all the new pages and components we've created. Click on any link below to navigate to that page.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pagesToTest.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">{page.name}</h3>
              <p className="text-gray-400">{page.description}</p>
            </Link>
          ))}
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Payment Components</h2>
        <p className="text-gray-300 mb-6">
          These components are not directly accessible via routes, but are used within other pages:
        </p>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-12">
          <ul className="space-y-4">
            {paymentComponents.map((component, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm mr-3">Component</span>
                <div>
                  <h3 className="font-semibold">{component.name}</h3>
                  <p className="text-gray-400 text-sm">{component.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <p className="text-gray-300 mb-4">
            To test all pages automatically, you can use the testPages utility:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4">
            <li>Open your browser's developer console (F12 or right-click and select "Inspect")</li>
            <li>Type <code className="bg-gray-700 px-2 py-1 rounded">window.testAllPages()</code> and press Enter</li>
            <li>The script will navigate through all pages with a 2-second delay between each</li>
          </ol>
          <p className="text-gray-300">
            You can also test each page individually by clicking on the links above.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PageTester;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaSearch, FaQuestionCircle, FaBook, FaHeadset, FaVideo, FaUserShield, FaMoneyBillWave, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqCategories = [
    {
      id: 'account',
      title: 'Account & Settings',
      icon: <FaUserShield className="text-blue-500" />,
      questions: [
        {
          id: 'account-1',
          question: 'How do I create an account?',
          answer: 'To create an account, click on the "Sign Up" button in the top right corner of the homepage. Fill in your details including name, email, and password. You can also sign up using your Google or Facebook account for quicker registration.'
        },
        {
          id: 'account-2',
          question: 'How do I reset my password?',
          answer: 'If you forgot your password, click on the "Login" button, then select "Forgot Password". Enter your email address and we\'ll send you a link to reset your password. Follow the instructions in the email to create a new password.'
        },
        {
          id: 'account-3',
          question: 'How do I change my profile picture?',
          answer: 'To change your profile picture, go to Settings > Profile. Click on your current profile picture or the default avatar, then select "Change Photo". You can upload a new image from your device. Make sure the image is clear and follows our community guidelines.'
        }
      ]
    },
    {
      id: 'videos',
      title: 'Videos & Playback',
      icon: <FaVideo className="text-red-500" />,
      questions: [
        {
          id: 'videos-1',
          question: 'Why is my video buffering or not playing?',
          answer: 'Buffering issues are usually related to your internet connection. Try lowering the video quality, refreshing the page, or checking your internet connection. If the problem persists, try clearing your browser cache or using a different browser.'
        },
        {
          id: 'videos-2',
          question: 'How do I download videos for offline viewing?',
          answer: 'To download videos for offline viewing, look for the download button below the video player. Note that not all videos are available for download, as this depends on the creator\'s settings. Downloaded videos can be accessed in the "Downloads" section of your library.'
        },
        {
          id: 'videos-3',
          question: 'How do I create and manage playlists?',
          answer: 'To create a playlist, click on the "Save" button below any video and select "Create new playlist". Give your playlist a name and description, then click "Create". To manage your playlists, go to the "Playlists" section in your library where you can edit, delete, or add videos to your playlists.'
        }
      ]
    },
    {
      id: 'creators',
      title: 'Creator Support',
      icon: <FaHeadset className="text-green-500" />,
      questions: [
        {
          id: 'creators-1',
          question: 'How do I become a creator?',
          answer: 'To become a creator, go to your account settings and select "Creator Settings". Click on "Become a Creator" and follow the steps to set up your channel. You\'ll need to provide some basic information about your channel and agree to our creator terms.'
        },
        {
          id: 'creators-2',
          question: 'How do I upload videos?',
          answer: 'To upload a video, click on the upload button in the top right corner. Select your video file, add a title, description, and thumbnail. You can also set visibility options, add tags, and choose a category before publishing. Make sure your content follows our community guidelines.'
        },
        {
          id: 'creators-3',
          question: 'How do I livestream?',
          answer: 'To start a livestream, go to the Creator Studio and select "Go Live". Set up your stream details including title, description, and thumbnail. You can choose between webcam streaming or screen sharing. Once everything is set up, click "Start Streaming" to go live.'
        }
      ]
    },
    {
      id: 'monetization',
      title: 'Monetization & Earnings',
      icon: <FaMoneyBillWave className="text-yellow-500" />,
      questions: [
        {
          id: 'monetization-1',
          question: 'How do I monetize my channel?',
          answer: 'To monetize your channel, you need to meet our eligibility requirements: 1,000 subscribers, 4,000 watch hours in the past 12 months, or 10 million Shorts views. Once eligible, go to Creator Studio > Monetization and follow the application process. We\'ll review your channel and notify you once approved.'
        },
        {
          id: 'monetization-2',
          question: 'How do earnings work?',
          answer: 'Earnings come from various sources including ad revenue, channel memberships, and Super Chats during livestreams. Your earnings are calculated based on factors like views, engagement, and ad performance. You can track your earnings in the Creator Studio under the Monetization tab.'
        },
        {
          id: 'monetization-3',
          question: 'How do I withdraw my earnings?',
          answer: 'To withdraw your earnings, go to Creator Studio > Monetization > Earnings. Click on "Withdraw" and select your preferred payment method (JazzCash, EasyPaisa, PayFast, or bank transfer). You need to reach the minimum threshold of Rs 1000 before you can request a withdrawal.'
        }
      ]
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, this would search through help articles
    console.log('Searching for:', searchQuery);
  };

  const toggleFaq = (id) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };

  const filteredFaqs = searchQuery.trim() === '' 
    ? faqCategories 
    : faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-gray-400 mb-8">Find answers to common questions or contact our support team</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help topics..."
              className="w-full bg-gray-800 text-white px-5 py-4 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FaSearch className="text-xl" />
            </button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link to="/help/getting-started" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <div className="bg-blue-900 p-3 rounded-full mr-4">
                <FaBook className="text-blue-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold">Getting Started</h3>
            </div>
            <p className="text-gray-400">Learn the basics of using our platform, from navigation to watching videos.</p>
          </Link>
          
          <Link to="/help/creator-academy" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <div className="bg-green-900 p-3 rounded-full mr-4">
                <FaVideo className="text-green-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold">Creator Academy</h3>
            </div>
            <p className="text-gray-400">Resources and guides to help you create better content and grow your audience.</p>
          </Link>
          
          <Link to="/help/contact-support" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <div className="bg-purple-900 p-3 rounded-full mr-4">
                <FaHeadset className="text-purple-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold">Contact Support</h3>
            </div>
            <p className="text-gray-400">Can't find what you're looking for? Reach out to our support team for help.</p>
          </Link>
        </div>
        
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <FaQuestionCircle className="text-blue-500 text-2xl mr-3" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          
          {filteredFaqs.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-xl mb-4">No results found for "{searchQuery}"</p>
              <p className="text-gray-400">Try using different keywords or browse our help categories</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFaqs.map(category => (
                <div key={category.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700 flex items-center">
                    <div className="mr-3">{category.icon}</div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-700">
                    {category.questions.map(faq => (
                      <div key={faq.id} className="p-4">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="flex justify-between items-center w-full text-left"
                        >
                          <span className="font-medium">{faq.question}</span>
                          {expandedFaq === faq.id ? (
                            <FaChevronUp className="text-gray-400" />
                          ) : (
                            <FaChevronDown className="text-gray-400" />
                          )}
                        </button>
                        
                        {expandedFaq === faq.id && (
                          <div className="mt-3 text-gray-400">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-gray-400 mb-6">Our support team is ready to assist you with any questions or issues</p>
          <Link to="/help/contact-support" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center">
            <FaHeadset className="mr-2" /> Contact Support
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Help;

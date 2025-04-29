import React from 'react';

const ChannelTabs = ({ activeTab, onTabChange, hasShorts, hasLive }) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'videos', label: 'Videos' },
    ...(hasShorts ? [{ id: 'shorts', label: 'Shorts' }] : []),
    ...(hasLive ? [{ id: 'live', label: 'Live' }] : []),
    { id: 'community', label: 'Community' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="border-b border-gray-800">
      <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ChannelTabs;

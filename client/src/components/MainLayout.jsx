import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Global Instagram Sidebar */}
      <Sidebar />
      
      {/* Main Page Content */}
      <div className="flex-1 h-full overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;

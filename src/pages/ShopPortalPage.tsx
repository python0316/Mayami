import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UnifiedDashboard } from '../components/UnifiedDashboard';
import { AdminPortalPage } from './AdminPortalPage';

export const ShopPortalPage: React.FC = () => {
  const { adminSession } = useApp();
  const navigate = useNavigate();

  // If authenticated, render the Unified Dashboard directly!
  if (adminSession) {
    return <UnifiedDashboard />;
  }

  // If not authenticated, render the unified login portal
  return <AdminPortalPage />;
};

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface AnalyticsContextType {
  trackPageView: (data?: Partial<PageViewData>) => void;
  trackClick: (data: ClickData) => void;
  trackEvent: (eventName: string, eventData?: any) => void;
  sessionId: string;
}

interface PageViewData {
  url: string;
  path: string;
  title: string;
  referrer: string;
  sessionId: string;
  screenWidth: number;
  screenHeight: number;
  loadTime: number;
}

interface ClickData {
  elementType: string;
  elementId?: string;
  elementText?: string;
  elementClass?: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('gc_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('gc_session_id', sessionId);
  }
  return sessionId;
};

// Get device and browser info
const getDeviceInfo = () => {
  if (typeof window === 'undefined') return {};
  
  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: navigator.userAgent
  };
};

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState('');
  const [pageLoadTime, setPageLoadTime] = useState<number>(0);

  useEffect(() => {
    setSessionId(getSessionId());
    
    // Track page load time
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      setPageLoadTime(loadTime);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback(async (data?: Partial<PageViewData>) => {
    if (!sessionId || typeof window === 'undefined') return;

    try {
      const deviceInfo = getDeviceInfo();
      const pageViewData: PageViewData = {
        url: window.location.href,
        path: pathname || window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        sessionId,
        screenWidth: deviceInfo.screenWidth || 0,
        screenHeight: deviceInfo.screenHeight || 0,
        loadTime: pageLoadTime,
        ...data
      };

      await fetch(`${API_BASE_URL}/api/analytics/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageViewData)
      });
    } catch (error) {
      // Silent fail - don't disrupt user experience
      console.debug('Analytics tracking failed:', error);
    }
  }, [sessionId, pathname, pageLoadTime]);

  // Track click event
  const trackClick = useCallback(async (data: ClickData) => {
    if (!sessionId || typeof window === 'undefined') return;

    try {
      const clickData = {
        url: window.location.href,
        path: pathname || window.location.pathname,
        sessionId,
        ...data
      };

      await fetch(`${API_BASE_URL}/api/analytics/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clickData)
      });
    } catch (error) {
      console.debug('Click tracking failed:', error);
    }
  }, [sessionId, pathname]);

  // Track custom event
  const trackEvent = useCallback(async (eventName: string, eventData?: any) => {
    if (!sessionId || typeof window === 'undefined') return;

    try {
      const event = {
        url: window.location.href,
        path: pathname || window.location.pathname,
        sessionId,
        eventName,
        eventData
      };

      await fetch(`${API_BASE_URL}/api/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.debug('Event tracking failed:', error);
    }
  }, [sessionId, pathname]);

  // Auto-track page views on route change
  useEffect(() => {
    if (sessionId && pathname) {
      // Don't track admin pages or account pages
      if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
        return;
      }

      // Small delay to ensure page title is updated
      const timer = setTimeout(() => {
        trackPageView();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname, sessionId, trackPageView]);

  const value = {
    trackPageView,
    trackClick,
    trackEvent,
    sessionId
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

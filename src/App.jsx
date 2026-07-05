import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import BoardPage from './pages/Board/BoardPage';
import TaskEditorPage from './pages/TaskEditor/TaskEditorPage';

// Navigation utility
export function navigate(path) {
  window.history.pushState({}, '', path);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
}

// Router-compatible Link component
export function Link({ href, className, id, style, children, title, onClick }) {
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    
    // Intercept relative paths for SPA routing
    if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <a href={href} className={className} id={id} style={style} onClick={handleClick} title={title}>
      {children}
    </a>
  );
}

function getRouteInfo() {
  // Extract path and clean it up (removing leading slash / ending .html for mapping)
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  return { pathname, params };
}

function AppContent() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState(() => getRouteInfo());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteInfo());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const path = route.pathname;

  // Route mapping matching both clean and legacy path names
  const isLanding = path === '/' || path.endsWith('/index.html') || path === '';
  const isLogin = path.endsWith('/login.html') || path === '/login';
  const isDashboard = path.endsWith('/home.html') || path === '/home' || path.endsWith('PRUEBA3'); // Support PRUEBA3 legacy path if any
  const isBoard = path.endsWith('/board.html') || path === '/board';
  const isTaskEditor = path.endsWith('/editortareas.html') || path === '/editortareas';

  // Auth Guards logic
  useEffect(() => {
    if (loading) return;

    if (user) {
      // If logged in, prevent visiting Landing or Login, redirect to Dashboard
      if (isLanding || isLogin) {
        navigate('home.html');
      }
    } else {
      // If not logged in, prevent visiting Dashboard, Board, or TaskEditor
      if (isDashboard || isBoard || isTaskEditor) {
        navigate('login.html');
      }
    }
  }, [user, loading, isLanding, isLogin, isDashboard, isBoard, isTaskEditor]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Render appropriate page based on route matching
  if (isLanding) {
    return <LandingPage />;
  }
  if (isLogin) {
    return <LoginPage />;
  }
  if (isDashboard) {
    return <DashboardPage routeParams={route.params} />;
  }
  if (isBoard) {
    return <BoardPage routeParams={route.params} />;
  }
  if (isTaskEditor) {
    return <TaskEditorPage routeParams={route.params} />;
  }

  // Fallback default: if user is logged in, show Dashboard, else Landing
  return user ? <DashboardPage routeParams={route.params} /> : <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

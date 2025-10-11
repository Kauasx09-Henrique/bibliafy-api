import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <main>

      <Outlet />
    </main>
  );
}

export default App;
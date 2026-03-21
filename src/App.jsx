import { useState, useEffect, useCallback } from 'react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { InstallBanner } from './components/InstallBanner';
import { IOSInstructions } from './components/IOSInstructions';
import { Download, ArrowRight } from 'lucide-react';
import './index.css';

function App() {
  const { deferredPrompt, isAppInstalled, isIOS, installApp } = usePWAInstall();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const targetUrl = 'https://www.vcb.services';

  const handleRedirect = useCallback(() => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 800);
  }, [isRedirecting, targetUrl]);

  const handleInstallAction = async () => {
    if (deferredPrompt) {
      await installApp();
      setShowInstallBanner(false);
    } else if (isIOS) {
      // Scroll to instructions
      const contactInfo = document.querySelector('.ios-instruction');
      if (contactInfo) {
        contactInfo.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Fallback: If no install prompt is available, just redirect to site
      handleRedirect();
    }
  };

  useEffect(() => {
    // If the app is already installed, or opened in standalone mode, redirect automatically
    if (isAppInstalled) {
      setTimeout(handleRedirect, 0);
    }
  }, [isAppInstalled, handleRedirect]);

  useEffect(() => {
    // Show install banner if prompt is available, and hasn't been dismissed in this session
    if (deferredPrompt && !sessionStorage.getItem('bannerDismissed')) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('bannerDismissed', 'true');
  };

  return (
    <>
      <div className={`loader-wrapper ${isRedirecting ? 'active' : ''}`}>
        <div className="spinner"></div>
      </div>

      <div className="container animate-fade-in">
        <div className="logo-wrapper delay-1">
          <img src="/icons/icon.jpg" alt="VCB Logo" className="logo-img" />
        </div>
        
        <h1 className="title delay-2">VCB Services</h1>
        <p className="subtitle delay-3">
          Access instantly from your home screen for a seamless, fast experience.
        </p>

        <div className="button-group delay-3">
          <button className="btn btn-primary" onClick={handleInstallAction}>
            <Download size={20} />
            Download App
          </button>

          <button className="btn btn-secondary" onClick={handleRedirect} style={{ background: 'transparent', border: 'none', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.8rem', opacity: 0.6 }}>
            <span>Continue to Website</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {isIOS && !isAppInstalled && <IOSInstructions />}
      </div>

      <InstallBanner 
        show={showInstallBanner && !isIOS} 
        onInstall={handleInstallAction} 
        onDismiss={dismissBanner} 
      />
    </>
  );
}

export default App;

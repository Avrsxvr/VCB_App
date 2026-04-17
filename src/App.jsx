import { useState, useEffect, useCallback } from 'react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { InstallBanner } from './components/InstallBanner';
import { IOSInstructions } from './components/IOSInstructions';
import { VideoIntro } from './components/VideoIntro';
import { Download, CheckCircle } from 'lucide-react';
import './index.css';

function App() {
  const { deferredPrompt, isAppInstalled, isIOS, isStandalone, installApp } = usePWAInstall();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [playingIntro, setPlayingIntro] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const targetUrl = 'https://www.vcb.services';

  const handleRedirect = useCallback(() => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    setPlayingIntro(false);
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 800);
  }, [isRedirecting, targetUrl]);

  // Handle "Download App" button click
  const handleInstallAction = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Play the download video after user accepts
        setCurrentVideo('/icons/download_video_optimized.mp4');
        setPlayingIntro(true);
      }
    } else if (isIOS) {
      const contactInfo = document.querySelector('.ios-instruction');
      if (contactInfo) {
        contactInfo.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // ONLY play pollito video when opened from HOME SCREEN ICON (standalone mode)
  useEffect(() => {
    if (isStandalone) {
      const hasPlayedThisSession = sessionStorage.getItem('intro-played') === 'true';
      
      if (!hasPlayedThisSession) {
        setCurrentVideo('/icons/pollito_compressed.mp4');
        setPlayingIntro(true);
        sessionStorage.setItem('intro-played', 'true');
      } else {
        handleRedirect();
      }
      
      const fallbackTimer = setTimeout(() => {
        handleRedirect();
      }, 15000);
      
      return () => clearTimeout(fallbackTimer);
    }
    // In browser mode: do nothing, just show the landing page
  }, [isStandalone, handleRedirect]);

  // Show install banner after a delay
  useEffect(() => {
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
      {playingIntro && currentVideo && (
        <VideoIntro src={currentVideo} onFinish={handleRedirect} />
      )}

      <div className={`loader-wrapper ${isRedirecting ? 'active' : ''}`}>
        <div className="spinner"></div>
      </div>

      <div className="container animate-fade-in">
        <div className="logo-wrapper delay-1">
          <img src="/icons/icon.jpg" alt="Pollito chicken Fingers Logo" className="logo-img" />
        </div>
        
        <h1 className="title delay-2">POLLITO CHICKEN FINGERS</h1>
        <p className="subtitle delay-3">
          {isAppInstalled 
            ? "Your app is ready! Open it from your home screen for the best experience."
            : "Access instantly from your home screen for a seamless, fast experience."}
        </p>

        <div className="button-group delay-3">
          {isAppInstalled ? (
            <button className="btn btn-primary" onClick={handleRedirect} style={{ backgroundColor: '#059669' }}>
              <CheckCircle size={20} />
              App Downloaded
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleInstallAction}>
              <Download size={20} />
              Download App
            </button>
          )}
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

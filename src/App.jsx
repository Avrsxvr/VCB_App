import { useState, useEffect, useCallback } from 'react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { InstallBanner } from './components/InstallBanner';
import { IOSInstructions } from './components/IOSInstructions';
import { VideoIntro } from './components/VideoIntro';
import { Download, ArrowRight } from 'lucide-react';
import './index.css';

function App() {
  const { deferredPrompt, isAppInstalled, isIOS, installApp } = usePWAInstall();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [playingIntro, setPlayingIntro] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('/icons/pollito_compressed.mp4');
  const targetUrl = 'https://www.vcb.services';

  const handleRedirect = useCallback(() => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 800);
  }, [isRedirecting, targetUrl]);

  const handleInstallAction = async () => {
    console.log('Install action triggered. deferredPrompt:', !!deferredPrompt);
    if (deferredPrompt) {
      // Trigger the prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User choice outcome:', outcome);
      
      if (outcome === 'accepted') {
        console.log('Installation accepted. Playing download video...');
        // Play the specific "Download Started" video
        setCurrentVideo('/icons/download_video.mp4');
        setPlayingIntro(true);
      }
      setShowInstallBanner(false);
    } else if (isIOS) {
      console.log('IOS detected, showing instructions');
      // Scroll to instructions
      const contactInfo = document.querySelector('.ios-instruction');
      if (contactInfo) {
        contactInfo.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      console.log('No install prompt available. Redirecting...');
      // Fallback: If no install prompt is available, just redirect
      handleRedirect();
    }
  };

  useEffect(() => {
    // If the app is opened from the icon (isAppInstalled/standalone mode)
    // Play the "Icon Click" video
    if (isAppInstalled) {
      console.log('App detected as installed/standalone. Playing icon click video...');
      const timer = setTimeout(() => {
        setCurrentVideo('/icons/pollito_compressed.mp4');
        setPlayingIntro(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAppInstalled]);

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
      {playingIntro && (
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
          Access instantly from your home screen for a seamless, fast experience.
        </p>

        <div className="button-group delay-3">
          <button className="btn btn-primary" onClick={handleInstallAction}>
            <Download size={20} />
            Download App
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

import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [promptChecked, setPromptChecked] = useState(false);

  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIPad = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return /iphone|ipad|ipod/.test(userAgent) || isIPad;
  });

  // Standalone check: true when opened from app icon
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const fromPWAParam = new URLSearchParams(window.location.search).get('source') === 'pwa';
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isSafariStandalone = window.navigator.standalone === true;
      const isAndroidApp = document.referrer && document.referrer.includes('android-app://');
      
      return isDisplayStandalone || isSafariStandalone || fromPWAParam || isAndroidApp;
    } catch (e) {
      return false;
    }
  });

  const [justInstalled, setJustInstalled] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPromptChecked(true);
      setIsAppInstalled(false);
    };

    const handleAppInstalled = () => {
      setJustInstalled(true);
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const timer = setTimeout(() => {
      setPromptChecked(true);
    }, 3000);

    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps().then((apps) => {
        if (apps && apps.length > 0) {
          setIsAppInstalled(true);
        }
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const isInstalled = justInstalled || 
    isAppInstalled || 
    (promptChecked && !deferredPrompt && !isIOS && !isStandalone);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return { deferredPrompt, isAppInstalled: isInstalled, isIOS, isStandalone, installApp };
};

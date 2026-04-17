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

  // Real-time check: are we in standalone mode right now?
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return ('standalone' in window.navigator && window.navigator.standalone) ||
      window.matchMedia('(display-mode: standalone)').matches ||
      new URLSearchParams(window.location.search).get('source') === 'pwa';
  });

  // This tracks if the app was JUST installed in the current session
  const [justInstalled, setJustInstalled] = useState(false);

  // This tracks if the app is ALREADY installed (no beforeinstallprompt fired)
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPromptChecked(true);
      // If we get the prompt, the app is NOT installed
      setIsAppInstalled(false);
    };

    const handleAppInstalled = () => {
      setJustInstalled(true);
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // After a short delay, if beforeinstallprompt hasn't fired,
    // the app is likely already installed (on supported browsers).
    const timer = setTimeout(() => {
      setPromptChecked(true);
    }, 3000);

    // Also try the getInstalledRelatedApps API for real-time detection
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

  // The app is considered installed if:
  // 1. The appinstalled event fired (justInstalled), OR
  // 2. The beforeinstallprompt did NOT fire after 3s AND we're not on iOS
  //    AND we're not in standalone mode (meaning we're in browser but app exists)
  const isInstalled = justInstalled || 
    isAppInstalled || 
    (promptChecked && !deferredPrompt && !isIOS && !isStandalone);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  return { deferredPrompt, isAppInstalled: isInstalled, isIOS, isStandalone, installApp };
};

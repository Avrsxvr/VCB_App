import { Download, ArrowRight } from 'lucide-react';

export const InstallBanner = ({ show, onInstall, onDismiss }) => {
  return (
    <div className={`install-banner ${show ? 'visible' : ''}`}>
      <div className="banner-content">
        <span className="banner-title">Add VCB Services</span>
        <span className="banner-subtitle">Install for better performance</span>
      </div>
      <div className="banner-actions">
        <button className="btn-small ghost" onClick={onDismiss}>Skip</button>
        <button className="btn-small primary" onClick={onInstall}>Install</button>
      </div>
    </div>
  );
};

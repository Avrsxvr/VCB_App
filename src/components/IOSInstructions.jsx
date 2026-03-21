import { Share, PlusSquare } from 'lucide-react';

export const IOSInstructions = () => {
  return (
    <div className="ios-instruction delay-3">
      <p style={{ fontWeight: 600, color: 'white' }}>Install on iOS</p>
      <div className="ios-step">
        <div className="icon-box">
          <Share size={16} />
        </div>
        <span>Tap the <strong>Share</strong> button below</span>
      </div>
      <div className="ios-step">
        <div className="icon-box">
          <PlusSquare size={16} />
        </div>
        <span>Select <strong>Add to Home Screen</strong></span>
      </div>
    </div>
  );
};

import React from 'react';
import { StoreConfig } from '../types';
import { Sparkles, X } from 'lucide-react';

interface AnnouncementBarProps {
  config: StoreConfig;
  onDismiss?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ config, onDismiss }) => {
  if (!config.showAnnouncement || !config.announcementText) return null;

  return (
    <div className="bg-neutral-950 text-neutral-100 text-xs py-2.5 px-4 tracking-widest uppercase font-medium border-b border-neutral-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] tracking-[0.2em]">ATELIER NOTIFICATION</span>
        </div>
        
        <div className="flex-1 text-center font-sans text-xs tracking-wider font-normal truncate sm:mx-4">
          <span>{config.announcementText}</span>
        </div>

        {onDismiss ? (
          <button
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-4 hidden sm:block"></div>
        )}
      </div>
    </div>
  );
};

'use client';

import { useEffect, useRef } from 'react';

interface JitsiCallRoomProps {
  roomID: string;
  userName: string;
  userEmail?: string;
  onLeave: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiCallRoom({ roomID, userName, userEmail, onLeave }: JitsiCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Load Jitsi script dynamically
    const loadJitsi = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = initJitsi;
      document.head.appendChild(script);
    };

    const initJitsi = () => {
      if (!containerRef.current) return;
      
      apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: `studyapp-${roomID}`,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          displayName: userName,
          email: userEmail || '',
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',       // Share screen
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'settings',
            'raisehand',
            'videoquality',
            'tileview',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          DISPLAY_WELCOME_FOOTER: false,
          MOBILE_APP_PROMO: false,
        },
      });

      // Listen for hang up
      apiRef.current.addEventListener('readyToClose', () => {
        onLeave();
      });
    };

    loadJitsi();

    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {}
      }
    };
  }, [roomID, userName, userEmail, onLeave]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '500px' }}
    />
  );
}

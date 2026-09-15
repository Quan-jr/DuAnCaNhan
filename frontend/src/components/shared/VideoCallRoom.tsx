'use client';

import { useEffect, useRef } from 'react';

interface VideoCallRoomProps {
  roomID: string;
  userID: string;
  userName: string;
  onLeave: () => void;
  zegoAppID: number;
  zegoAppSign: string;
}

export default function VideoCallRoom({ 
  roomID, 
  userID, 
  userName, 
  onLeave,
  zegoAppID,
  zegoAppSign
}: VideoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    let zp: any = null;

    const initCall = async () => {
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        zegoAppID,
        zegoAppSign,
        roomID,
        userID,
        userName
      );

      zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [{
          name: 'Copy link mời',
          url: `${window.location.origin}/focus-room?roomID=${roomID}`,
        }],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: true,
        showTurnOffRemoteCameraButton: false,
        showTurnOffRemoteMicrophoneButton: false,
        showRemoveUserButton: false,
        maxUsers: 4,
        layout: 'Auto',
        onLeaveRoom: () => {
          onLeave();
        },
      });
    };

    initCall();

    return () => {
      if (zp) {
        try {
          zp.destroy?.();
        } catch {}
      }
    };
  }, [roomID, userID, userName, zegoAppID, zegoAppSign, onLeave]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}

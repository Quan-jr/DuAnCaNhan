'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  useAnimations, 
  ContactShadows, 
  Float, 
  Environment, 
  Sparkles 
} from '@react-three/drei';
import * as THREE from 'three';
import { PetId } from './FocusPet';

interface Pomodoro3DPetProps {
  petId: PetId;
  isRunning: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak';
}

const PET_MODEL_MAP: Record<PetId, { url: string; scale: number; position: [number, number, number] }> = {
  cat: { url: '/models/fox.glb', scale: 0.019, position: [0, -0.85, 0] },
  shiba: { url: '/models/fox.glb', scale: 0.019, position: [0, -0.85, 0] },
  bunny: { url: '/models/fox.glb', scale: 0.019, position: [0, -0.85, 0] },
  dragon: { url: '/models/dragon.glb', scale: 7.5, position: [0, -0.8, 0] },
  penguin: { url: '/models/duck.glb', scale: 0.85, position: [0, -0.8, 0] },
  panda: { url: '/models/duck.glb', scale: 0.85, position: [0, -0.8, 0] },
};

function PetScene({ petId, isRunning, mode }: Pomodoro3DPetProps) {
  const group = useRef<THREE.Group>(null);
  const config = PET_MODEL_MAP[petId] || PET_MODEL_MAP.cat;
  const { scene, animations } = useGLTF(config.url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length === 0) return;

    let targetName = names[0];
    if (isRunning) {
      targetName = names.find((n) => /run|walk|move/i.test(n)) || names[1] || names[0];
    } else {
      targetName = names.find((n) => /survey|idle|stand/i.test(n)) || names[0];
    }

    const action = actions[targetName];
    if (action) {
      Object.values(actions).forEach((a) => a?.fadeOut(0.3));
      action.reset().fadeIn(0.3).play();
    }

    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names, isRunning]);

  return (
    <group ref={group} position={config.position} dispose={null}>
      <Float
        speed={isRunning ? 3 : 1.6}
        rotationIntensity={isRunning ? 0.25 : 0.08}
        floatIntensity={isRunning ? 0.35 : 0.15}
      >
        <primitive object={scene} scale={config.scale} castShadow receiveShadow />
      </Float>
    </group>
  );
}

export default function Pomodoro3DPet({ petId, isRunning, mode }: Pomodoro3DPetProps) {
  const themeColor = mode === 'focus' ? '#f43f5e' : mode === 'shortBreak' ? '#14b8a6' : '#3b82f6';

  return (
    <div className="w-40 h-40 sm:w-44 sm:h-44 relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <Canvas
        camera={{ position: [0, 1.2, 3.2], fov: 40 }}
        dpr={[1, 1.3]} // Tối ưu GPU: tránh render quá nhiều pixel trên màn hình 2K/4K
        performance={{ min: 0.5 }} // Tự động giảm độ phân giải tạm thời nếu FPS giảm
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        className="w-full h-full"
      >
        {/* Ánh sáng tối ưu hiệu năng */}
        <ambientLight intensity={1.3} />
        <directionalLight position={[3, 5, 3]} intensity={1.8} />
        <pointLight position={[0, -0.6, 1.2]} intensity={1.2} color={themeColor} distance={4} />

        <Suspense fallback={null}>
          {/* Vòng sáng ma thuật dưới chân đồng hồ */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.86, 0]}>
            <ringGeometry args={[0.75, 0.82, 48]} />
            <meshBasicMaterial color={themeColor} transparent opacity={0.5} />
          </mesh>

          <PetScene petId={petId} isRunning={isRunning} mode={mode} />

          {/* Hạt phát sáng bay lượn */}
          <Sparkles
            count={isRunning ? 25 : 12}
            scale={2}
            size={isRunning ? 3.5 : 2}
            speed={isRunning ? 0.8 : 0.3}
            color={themeColor}
            opacity={0.75}
          />

          <ContactShadows position={[0, -0.87, 0]} opacity={0.7} scale={2.8} blur={1.4} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!isRunning}
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

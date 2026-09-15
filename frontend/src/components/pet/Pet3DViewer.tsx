'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  useAnimations, 
  ContactShadows, 
  Environment, 
  Sparkles,
  Float
} from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  currentAction?: string;
  onActionsLoaded?: (actions: string[]) => void;
}

function Model({ url, scale = 1, position = [0, -1, 0], currentAction, onActionsLoaded }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  // Notify parent of available animation names
  useEffect(() => {
    if (onActionsLoaded && names.length > 0) {
      onActionsLoaded(names);
    }
  }, [names, onActionsLoaded]);

  // Handle animation switching smoothly
  useEffect(() => {
    if (names.length === 0) return;

    const targetName = (currentAction && actions[currentAction]) ? currentAction : names[0];
    const targetAction = actions[targetName];

    if (targetAction) {
      Object.values(actions).forEach((a) => {
        if (a && a !== targetAction) {
          a.fadeOut(0.3);
        }
      });
      targetAction.reset().fadeIn(0.3).play();
    }

    return () => {
      targetAction?.fadeOut(0.3);
    };
  }, [actions, names, currentAction]);

  return (
    <group ref={group} position={position} dispose={null}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.25}>
        <primitive object={scene} scale={scale} castShadow receiveShadow />
      </Float>
    </group>
  );
}

// Bệ đứng ma thuật (Magical Battle Pedestal)
function MagicPedestal() {
  return (
    <group position={[0, -1.22, 0]}>
      {/* Vòng hào quang ngoài cùng */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.62, 64]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.65} />
      </mesh>

      {/* Vòng hoa văn bên trong */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.25, 64]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </mesh>

      {/* Sàn đá bệ đứng phản chiếu bóng bẩy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[1.55, 64]} />
        <meshStandardMaterial 
          color="#1e1e2f" 
          roughness={0.25} 
          metalness={0.7} 
        />
      </mesh>
    </group>
  );
}

interface Pet3DViewerProps {
  modelUrl: string;
  scale?: number;
  position?: [number, number, number];
  currentAction?: string;
  onActionsLoaded?: (actions: string[]) => void;
  autoRotate?: boolean;
}

export default function Pet3DViewer({
  modelUrl,
  scale = 0.025,
  position = [0, -1.2, 0],
  currentAction,
  onActionsLoaded,
  autoRotate = false,
}: Pet3DViewerProps) {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 2.2, 4.8], fov: 42 }}
        shadows
        dpr={[1, 1.4]} // Tối ưu GPU cân bằng giữa siêu nét và siêu mượt
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        {/* Môi trường ánh sáng HDRI Studio tạo phản quang vảy/lông/sừng chân thực */}
        <Environment preset="city" environmentIntensity={0.7} />

        {/* Hệ thống ánh sáng tối ưu */}
        <ambientLight intensity={1.2} />

        {/* Key Light */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* Rim Light (Đèn viền tím huyền bí làm nổi khối Pet) */}
        <directionalLight position={[-4, 3, -4]} intensity={2.0} color="#a855f7" />

        {/* Warm Fill Light (Đèn màu ấm áp từ sàn hắt lên) */}
        <pointLight position={[0, -0.8, 2]} intensity={1.5} color="#fb923c" distance={6} />

        <Suspense fallback={null}>
          {/* Bệ đứng ma thuật */}
          <MagicPedestal />

          {/* Model Pet 3D */}
          <Model
            key={modelUrl}
            url={modelUrl}
            scale={scale}
            position={position}
            currentAction={currentAction}
            onActionsLoaded={onActionsLoaded}
          />

          {/* Hiệu ứng hạt bụi phát sáng ma thuật lơ lửng xung quanh */}
          <Sparkles
            count={45}
            scale={3.5}
            size={3}
            speed={0.4}
            color="#f59e0b"
            opacity={0.7}
          />
          <Sparkles
            count={25}
            scale={2.5}
            size={4}
            speed={0.3}
            color="#ec4899"
            opacity={0.5}
          />

          {/* Bóng đổ tiếp xúc chân thực trên sàn */}
          <ContactShadows
            position={[0, -1.22, 0]}
            opacity={0.8}
            scale={6}
            blur={1.6}
            far={3}
          />
        </Suspense>

        {/* Điều khiển xoay chuột mượt mà */}
        <OrbitControls
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          minDistance={2.5}
          maxDistance={7.5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/fox.glb');
useGLTF.preload('/models/duck.glb');

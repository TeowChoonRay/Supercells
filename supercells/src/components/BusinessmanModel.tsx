import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function BusinessmanModel({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const modelRef = useRef<THREE.Group>();
  const rightArmRef = useRef<THREE.Mesh>();
  const [isWaving, setIsWaving] = useState(false);
  const [waveProgress, setWaveProgress] = useState(0);

  useFrame(() => {
    if (!modelRef.current || !rightArmRef.current) return;

    // Smooth rotation based on mouse position
    const targetRotationY = (mouseX - 0.5) * Math.PI * 0.5;
    const targetRotationX = (mouseY - 0.5) * Math.PI * 0.25;

    modelRef.current.rotation.y += (targetRotationY - modelRef.current.rotation.y) * 0.1;
    modelRef.current.rotation.x += (targetRotationX - modelRef.current.rotation.x) * 0.1;

    // Wave animation
    if (isWaving) {
      setWaveProgress((prev) => {
        const next = prev + 0.1;
        if (next >= Math.PI * 2) {
          setIsWaving(false);
          return 0;
        }
        return next;
      });

      // Rotate arm in a waving motion
      rightArmRef.current.rotation.z = -Math.PI * 0.1 - Math.sin(waveProgress) * 0.5;
      rightArmRef.current.rotation.y = Math.cos(waveProgress) * 0.25;
    } else {
      // Return to default position
      rightArmRef.current.rotation.z = -Math.PI * 0.1;
      rightArmRef.current.rotation.y = 0;
    }
  });

  const handleClick = () => {
    if (!isWaving) {
      setIsWaving(true);
      setWaveProgress(0);
    }
  };

  return (
    <group ref={modelRef} onClick={handleClick}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#e4c1ad" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.5, 2, 32]} />
        <meshStandardMaterial color="#d76b78" />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.8, 0.2, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        <cylinderGeometry args={[0.2, 0.2, 1.2, 32]} />
        <meshStandardMaterial color="#e4c1ad" />
      </mesh>

      {/* Right Arm (with wave animation) */}
      <mesh 
        ref={rightArmRef}
        position={[0.8, 0.2, 0]} 
        rotation={[0, 0, -Math.PI * 0.1]}
      >
        <cylinderGeometry args={[0.2, 0.2, 1.2, 32]} />
        <meshStandardMaterial color="#e4c1ad" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, -1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 32]} />
        <meshStandardMaterial color="#e4c1ad" />
      </mesh>
      <mesh position={[0.3, -1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 32]} />
        <meshStandardMaterial color="#e4c1ad" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 1.6, 0.4]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.15, 1.6, 0.4]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.15, 1.6, 0.48]}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.15, 1.6, 0.48]}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 1.35, 0.4]} rotation={[0, 0, Math.PI * 0.1]}>
        <torusGeometry args={[0.1, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#d76b78" />
      </mesh>
    </group>
  );
}

export function BusinessmanCanvas() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full h-full cursor-pointer">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <BusinessmanModel mouseX={mousePosition.x} mouseY={mousePosition.y} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
import { useRef, Suspense } from 'react'
import { PerspectiveCamera, Sky, ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Model } from './models/Model'
import Loader from './components/Loader'
import { useScrollAnimation } from './hooks/useScrollAnimation'

export default function Experience() {
  const modelRef = useRef()
  const { camera } = useThree()
  
  useScrollAnimation(modelRef, camera)

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 80, 150]} fov={35} />
      
      <color attach="background" args={['#a5d6e7']} />
      {/* Increased fog range for the new distant perspective */}
      <fog attach="fog" args={['#a5d6e7', 50, 400]} />
      
      <Sky distance={450000} sunPosition={[10, 20, 10]} inclination={0} azimuth={0.25} />
      
      <ambientLight intensity={0.8} />
      <directionalLight position={[50, 100, 50]} intensity={1.5} />
      
      <Suspense fallback={null}>
        <group ref={modelRef}>
          <Model />
        </group>
        
        <ContactShadows 
          position={[0, -2.4, 0]} 
          opacity={0.15} 
          scale={200} 
          blur={3} 
          far={20} 
        />
      </Suspense>
    </>
  )
}

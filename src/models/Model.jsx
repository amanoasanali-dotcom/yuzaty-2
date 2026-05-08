import React, { useRef, useMemo } from 'react'
import { useGLTF, Sparkles, Instances, Instance } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Model(props) {
  const cloudRef = useRef()
  const butterflyRef = useRef()
  
  const grass1 = useGLTF('/assets/models/grass.glb')
  const grass2 = useGLTF('/assets/models/grass_variant.glb')
  const cloud = useGLTF('/assets/models/cloud.glb')
  const sun = useGLTF('/assets/models/sun.glb')
  const mountains = useGLTF('/assets/models/mountains.glb')
  const ground = useGLTF('/assets/models/ground.glb')
  const rock = useGLTF('/assets/models/rock_single.glb')
  const butterfly = useGLTF('/assets/models/butterfly.glb')

  // Ground Tiling: Creating a 3x3 grid for "infinite" feel
  const groundGrid = useMemo(() => {
    const tiles = []
    const size = 60 // Approximate size of the ground model at scale 15
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        tiles.push([x * size, -5, z * size])
      }
    }
    return tiles
  }, [])

  const grassData = useMemo(() => {
    const temp = []
    const count = 400 
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 100 // Wider radius for the new altitude
      temp.push({
        position: [Math.cos(angle) * radius, -4.5, Math.sin(angle) * radius],
        rotation: [0, Math.random() * Math.PI, 0],
        scale: 1.5 + Math.random() * 1.5,
        type: Math.random() > 0.5 ? 1 : 2,
        speed: 0.8 + Math.random() * 0.4
      })
    }
    return temp
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (butterflyRef.current) {
      butterflyRef.current.position.x = Math.sin(t * 0.3) * 30
      butterflyRef.current.position.z = Math.cos(t * 0.3) * 30
      butterflyRef.current.position.y = 20 + Math.sin(t * 2) * 5
    }
    if (cloudRef.current) {
      cloudRef.current.position.y = 100 + Math.sin(t * 0.4) * 10
    }
  })

  const getMesh = (gltf) => {
    let mesh = null
    gltf.scene.traverse((child) => {
      if (child.isMesh && !mesh) mesh = child
    })
    return mesh
  }

  const g1Mesh = getMesh(grass1)
  const g2Mesh = getMesh(grass2)

  return (
    <group dispose={null}>
      {/* TILED GROUND: Copying the ground model to create a vast landscape */}
      {groundGrid.map((pos, i) => (
        <primitive 
          key={i} 
          object={ground.scene.clone()} 
          position={pos} 
          scale={20} 
        />
      ))}

      {/* Distant Mountains */}
      <primitive object={mountains.scene} position={[0, -50, -600]} scale={150} />

      {/* Rock */}
      <primitive object={rock.scene} position={[40, -4.5, -40]} scale={5} />

      {/* Optimized Grass */}
      {g1Mesh && (
        <Instances range={250} geometry={g1Mesh.geometry} material={g1Mesh.material}>
          {grassData.filter(d => d.type === 1).map((data, i) => (
            <GrassInstance key={i} {...data} />
          ))}
        </Instances>
      )}
      
      {g2Mesh && (
        <Instances range={250} geometry={g2Mesh.geometry} material={g2Mesh.material}>
          {grassData.filter(d => d.type === 2).map((data, i) => (
            <GrassInstance key={i} {...data} />
          ))}
        </Instances>
      )}

      <primitive ref={butterflyRef} object={butterfly.scene} scale={0.001} />
      <primitive ref={cloudRef} object={cloud.scene} position={[0, 100, -200]} scale={25} />
      <primitive object={sun.scene} position={[600, 600, -1000]} scale={80} />

      <Sparkles count={300} scale={300} size={2} speed={0.3} opacity={0.2} color="#fff" />
    </group>
  )
}

function GrassInstance({ position, rotation, scale, speed }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.z = Math.sin(t * speed + position[0] * 0.1) * 0.1
    }
  })
  return <Instance ref={ref} position={position} rotation={rotation} scale={scale} />
}

useGLTF.preload('/assets/models/grass.glb')
useGLTF.preload('/assets/models/grass_variant.glb')
useGLTF.preload('/assets/models/cloud.glb')
useGLTF.preload('/assets/models/sun.glb')
useGLTF.preload('/assets/models/mountains.glb')
useGLTF.preload('/assets/models/ground.glb')
useGLTF.preload('/assets/models/rock_single.glb')
useGLTF.preload('/assets/models/butterfly.glb')

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { NICKNAME } from '../../data/content'
import './scenes.css'

function HeartMesh() {
  const mesh = useRef(null)
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const x = 0
    const y = 0
    shape.moveTo(x, y + 0.35)
    shape.bezierCurveTo(x, y + 0.35, x - 0.35, y, x - 0.35, y - 0.25)
    shape.bezierCurveTo(x - 0.35, y - 0.55, x, y - 0.85, x, y - 1.05)
    shape.bezierCurveTo(x, y - 0.85, x + 0.35, y - 0.55, x + 0.35, y - 0.25)
    shape.bezierCurveTo(x + 0.35, y, x, y + 0.35, x, y + 0.35)

    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    })
    extrude.center()
    extrude.rotateX(Math.PI)
    return extrude
  }, [])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 2.2) * 0.06
    mesh.current.scale.setScalar(pulse)
    mesh.current.rotation.y = Math.sin(t * 0.6) * 0.35
  })

  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
      <mesh ref={mesh} geometry={geometry} castShadow>
        <MeshDistortMaterial
          color="#f472b6"
          emissive="#be185d"
          emissiveIntensity={0.25}
          roughness={0.25}
          metalness={0.15}
          distort={0.15}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

function OrbitingPetals() {
  const group = useRef(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35
  })

  return (
    <group ref={group}>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 2.1, Math.sin(angle * 2) * 0.35, Math.sin(angle) * 2.1]}
            scale={0.12}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#ffc2dd" emissive="#ec4899" emissiveIntensity={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function HeartScene() {
  return (
    <section className="scene heart-scene">
      <div className="scene-copy">
        <h2>为你跳动</h2>
        <p>这颗心，只为 {NICKNAME} 而亮。</p>
      </div>
      <div className="r3f-stage">
        <Canvas camera={{ position: [0, 0, 4.2], fov: 42 }} dpr={[1, 1.75]}>
          <color attach="background" args={['#ffc0cb']} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 4, 2]} intensity={1.15} color="#ffffff" />
          <pointLight position={[-2, -1, 2]} intensity={0.7} color="#be1a25" />
          <HeartMesh />
          <OrbitingPetals />
        </Canvas>
      </div>
    </section>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { useBlowDetection } from '../../hooks/useBlowDetection'
import PrimaryButton from '../story/PrimaryButton'
import StoryBackground from '../story/StoryBackground'
import StoryCopy from '../story/StoryCopy'
import './scenes.css'

function Flame({ lit, position }) {
  const ref = useRef(null)
  useFrame((state) => {
    if (!ref.current) return
    if (!lit) {
      ref.current.scale.setScalar(0.001)
      return
    }
    const t = state.clock.elapsedTime
    ref.current.scale.set(
      0.85 + Math.sin(t * 18 + position[0]) * 0.15,
      1 + Math.sin(t * 22 + position[2]) * 0.2,
      0.85,
    )
  })

  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.06, 0.18, 8]} />
      <meshStandardMaterial
        color="#ffd27a"
        emissive="#ff9f1c"
        emissiveIntensity={lit ? 2.2 : 0}
        transparent
        opacity={lit ? 1 : 0}
      />
    </mesh>
  )
}

function BirthdayCake({ lit }) {
  const candles = useMemo(
    () => [
      [-0.35, 0.78, 0.1],
      [0, 0.82, -0.15],
      [0.35, 0.78, 0.1],
    ],
    [],
  )

  return (
    <Float speed={1.1} floatIntensity={0.35} rotationIntensity={0.15}>
      <group position={[0, -0.35, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.12, 0.55, 48]} />
          <meshStandardMaterial color="#ffc2dd" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <cylinderGeometry args={[0.78, 0.86, 0.42, 48]} />
          <meshStandardMaterial color="#fff5f9" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <torusGeometry args={[0.72, 0.05, 12, 48]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>

        {candles.map((pos, i) => (
          <group key={i}>
            <mesh position={[pos[0], 0.55, pos[2]]}>
              <cylinderGeometry args={[0.035, 0.035, 0.35, 12]} />
              <meshStandardMaterial color="#ffe4f1" />
            </mesh>
            <Flame lit={lit} position={[pos[0], pos[1], pos[2]]} />
          </group>
        ))}
      </group>
    </Float>
  )
}

function statusCopy(status, lit) {
  if (!lit || status === 'done') return '愿望已收下，蜡烛熄灭啦！'
  if (status === 'blowing') return '检测到吹气，再坚持一下…'
  if (status === 'listening') return '正在听，对着麦克风轻轻吹一口气～'
  if (status === 'denied') return '未授权麦克风 · 可用下方按钮吹灭'
  return '点「用麦克风吹蜡烛」开启权限，或直接手动吹灭'
}

export default function CakeScene({ onExtinguished }) {
  const [lit, setLit] = useState(true)
  const blownRef = useRef(false)
  const { status, startListening, setOnBlow, setMeterEl } = useBlowDetection({
    enabled: lit,
    holdMs: 380,
  })

  useEffect(() => {
    setOnBlow(() => {
      if (blownRef.current) return
      blownRef.current = true
      setLit(false)
      onExtinguished?.()
    })
  }, [onExtinguished, setOnBlow])

  const extinguishManually = () => {
    if (blownRef.current) return
    blownRef.current = true
    setLit(false)
    onExtinguished?.()
  }

  // Denied: keep manual only — do not re-prompt getUserMedia.
  const showMicButton = lit && status === 'idle'
  const showMeter = lit && (status === 'listening' || status === 'blowing')

  return (
    <section className="scene cake-scene">
      <StoryBackground variant="blush" />
      <StoryCopy title="许个愿吧" subtitle={statusCopy(status, lit)} />

      <div className="r3f-stage cake-stage">
        <Canvas camera={{ position: [0, 1.2, 3.4], fov: 42 }} dpr={[1, 1.75]}>
          <color attach="background" args={['#ffc0cb']} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[2, 4, 3]} intensity={1.15} color="#ffffff" />
          <pointLight
            position={[0, 1.5, 0.5]}
            intensity={lit ? 1.4 : 0.35}
            color="#ffb347"
          />
          <BirthdayCake lit={lit} />
        </Canvas>
      </div>

      <div className="cake-controls">
        {showMeter ? (
          <div className="mic-meter" aria-hidden>
            <div className="mic-meter-fill" ref={setMeterEl} />
          </div>
        ) : null}

        {lit && status === 'denied' ? (
          <p className="mic-hint">未授权麦克风 · 可用下方按钮</p>
        ) : null}
        {lit && status === 'blowing' ? <p className="mic-hint hot">检测到吹气…</p> : null}

        {showMicButton ? (
          <PrimaryButton onClick={() => startListening()}>用麦克风吹蜡烛</PrimaryButton>
        ) : null}

        {lit ? (
          <PrimaryButton variant="ghost" onClick={extinguishManually}>
            轻轻吹灭蜡烛
          </PrimaryButton>
        ) : null}
      </div>
    </section>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { buildWallPhotos } from '../../data/content'
import { useStoryConfig } from '../../context/StoryConfig'
import { prefersReducedMotion } from '../../styles/motion'
import LiquidGlassPanel from '../glass/LiquidGlassPanel'
import PrimaryButton from '../story/PrimaryButton'
import StoryBackground from '../story/StoryBackground'
import StoryCopy from '../story/StoryCopy'
import './scenes.css'

const LAYOUTS = [
  { id: 'table', label: '表格' },
  { id: 'sphere', label: '球球' },
  { id: 'helix', label: '螺旋' },
  { id: 'grid', label: '格子' },
]

function buildTargets(count) {
  const table = []
  const sphere = []
  const helix = []
  const grid = []

  const cols = 8
  for (let i = 0; i < count; i += 1) {
    const t = new THREE.Object3D()
    const col = i % cols
    const row = Math.floor(i / cols)
    t.position.x = col * 140 - ((cols - 1) * 140) / 2
    t.position.y = -row * 160 + 280
    table.push(t)
  }

  const spherical = new THREE.Spherical()
  const vector = new THREE.Vector3()
  for (let i = 0; i < count; i += 1) {
    const phi = Math.acos(-1 + (2 * i) / count)
    const theta = Math.sqrt(count * Math.PI) * phi
    const object = new THREE.Object3D()
    spherical.set(620, phi, theta)
    object.position.setFromSpherical(spherical)
    vector.copy(object.position).multiplyScalar(2)
    object.lookAt(vector)
    sphere.push(object)
  }

  const cylindrical = new THREE.Cylindrical()
  for (let i = 0; i < count; i += 1) {
    const object = new THREE.Object3D()
    cylindrical.set(720, i * 0.22 + Math.PI, -(i * 8) + 220)
    object.position.setFromCylindrical(cylindrical)
    vector.set(object.position.x * 2, object.position.y, object.position.z * 2)
    object.lookAt(vector)
    helix.push(object)
  }

  for (let i = 0; i < count; i += 1) {
    const object = new THREE.Object3D()
    object.position.x = (i % 5) * 280 - 560
    object.position.y = -(Math.floor(i / 5) % 4) * 240 + 280
    object.position.z = Math.floor(i / 20) * 280 - 280
    grid.push(object)
  }

  return { table, sphere, helix, grid }
}

export default function AlbumScene() {
  const { config } = useStoryConfig()
  const mountRef = useRef(null)
  const apiRef = useRef(null)
  const [layout, setLayout] = useState('table')
  const [preview, setPreview] = useState(null)

  const wallPhotos = useMemo(() => buildWallPhotos(config.memories), [config.memories])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const reduced = prefersReducedMotion()
    const width = mount.clientWidth || 1
    const height = mount.clientHeight || 1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 10000)
    camera.position.z = 2400

    const renderer = new CSS3DRenderer()
    renderer.setSize(width, height)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    renderer.domElement.style.touchAction = 'none'
    mount.appendChild(renderer.domElement)

    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 0.55
    controls.minDistance = 600
    controls.maxDistance = 4200
    controls.noPan = true

    const objects = []
    const targets = buildTargets(wallPhotos.length)
    let morphTl = null
    let frame = 0
    const spin = !reduced
    const spinSpeed = 0.004

    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (spin) scene.rotation.y += spinSpeed
      controls.update()
      renderer.render(scene, camera)
    }

    wallPhotos.forEach((photo, i) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'wall-card'
      el.setAttribute('aria-label', photo.title)
      el.style.backgroundColor = `rgba(190, 26, 37, ${0.12 + (i % 5) * 0.04})`
      el.innerHTML = `<img src="${photo.src}" alt="" draggable="false" decoding="async" loading="${i < 6 ? 'eager' : 'lazy'}" />`
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setPreview(photo)
      })

      const object = new CSS3DObject(el)
      object.position.set(
        ((i * 97) % 900) - 450,
        ((i * 61) % 700) - 350,
        ((i * 43) % 500) - 250,
      )
      scene.add(object)
      objects.push(object)
    })

    const transformTo = (key, duration = 1400) => {
      const list = targets[key]
      if (!list) return
      morphTl?.kill()
      const base = reduced ? 0.28 : duration / 1000
      morphTl = gsap.timeline()
      objects.forEach((object, i) => {
        const target = list[i]
        if (!target) return
        const stagger = reduced ? 0 : Math.min(i * 0.012, 0.18)
        morphTl.to(
          object.position,
          {
            x: target.position.x,
            y: target.position.y,
            z: target.position.z,
            duration: base,
            ease: 'power3.inOut',
          },
          stagger,
        )
        morphTl.to(
          object.rotation,
          {
            x: target.rotation.x,
            y: target.rotation.y,
            z: target.rotation.z,
            duration: base,
            ease: 'power3.inOut',
          },
          stagger,
        )
      })
    }

    const onResize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    let cycle = null
    if (!reduced) {
      cycle = window.setInterval(() => {
        setLayout((prev) => {
          const idx = LAYOUTS.findIndex((l) => l.id === prev)
          const next = LAYOUTS[(idx + 1) % LAYOUTS.length].id
          transformTo(next, 1400)
          return next
        })
      }, 9000)
    }

    const stopAutoCycle = () => {
      if (!cycle) return
      window.clearInterval(cycle)
      cycle = null
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
        return
      }
      if (!frame) tick()
    }
    document.addEventListener('visibilitychange', onVisibility)

    apiRef.current = { transformTo, stopAutoCycle }
    transformTo('table', reduced ? 400 : 1800)
    tick()

    return () => {
      stopAutoCycle()
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      morphTl?.kill()
      gsap.killTweensOf(objects.map((o) => o.position))
      gsap.killTweensOf(objects.map((o) => o.rotation))
      objects.forEach((obj) => {
        scene.remove(obj)
        obj.element.remove()
      })
      renderer.domElement.remove()
      apiRef.current = null
    }
  }, [wallPhotos])

  const switchLayout = (id) => {
    apiRef.current?.stopAutoCycle()
    setLayout(id)
    apiRef.current?.transformTo(id, prefersReducedMotion() ? 400 : 1500)
  }

  return (
    <section className="scene album-scene album-wall-scene">
      <StoryBackground scene="album" />
      <StoryCopy title="回忆照片墙" className="wall-copy" />

      <div ref={mountRef} className="wall-stage" aria-label="可拖拽旋转的照片墙" />

      <div className="wall-menu">
        {LAYOUTS.map((item) => (
          <PrimaryButton
            key={item.id}
            variant="chip"
            className={layout === item.id ? 'is-active' : ''}
            onClick={() => switchLayout(item.id)}
          >
            {item.label}
          </PrimaryButton>
        ))}
      </div>

      {preview ? (
        <div
          className="wall-preview-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreview(null)
          }}
        >
          <LiquidGlassPanel
            className="wall-preview"
            fallbackClassName="wall-preview"
            width="min(88vw, 22rem)"
            padding="1.15rem 1rem 1.2rem"
            style={{ top: '46%' }}
          >
            <div className="wall-preview-inner" role="dialog" aria-label={preview.title}>
              <button
                type="button"
                className="wall-preview-close"
                aria-label="关闭"
                onClick={() => setPreview(null)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                  <path
                    d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <img src={preview.src} alt={preview.title} decoding="async" />
              <h3>{preview.title}</h3>
              <p>{preview.caption}</p>
            </div>
          </LiquidGlassPanel>
        </div>
      ) : null}
    </section>
  )
}

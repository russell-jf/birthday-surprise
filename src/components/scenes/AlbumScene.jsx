import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { WALL_PHOTOS } from '../../data/content'
import { prefersReducedMotion } from '../../styles/motion'
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
  const mountRef = useRef(null)
  const apiRef = useRef(null)
  const [layout, setLayout] = useState('table')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const reduced = prefersReducedMotion()
    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 10000)
    camera.position.z = 2400

    const renderer = new CSS3DRenderer()
    renderer.setSize(width, height)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    mount.appendChild(renderer.domElement)

    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 0.55
    controls.minDistance = 600
    controls.maxDistance = 4200
    controls.noPan = true

    const objects = []
    const targets = buildTargets(WALL_PHOTOS.length)

    WALL_PHOTOS.forEach((photo, i) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'wall-card'
      el.style.backgroundColor = `rgba(190, 26, 37, ${0.12 + Math.random() * 0.22})`
      el.innerHTML = `<img src="${photo.src}" alt="${photo.title}" draggable="false" /><span>${i + 1}</span>`
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setPreview(photo)
      })

      const object = new CSS3DObject(el)
      object.position.set(
        Math.random() * 2800 - 1400,
        Math.random() * 2800 - 1400,
        Math.random() * 2800 - 1400,
      )
      scene.add(object)
      objects.push(object)
    })

    const transformTo = (key, duration = 1600) => {
      const list = targets[key]
      const dur = reduced ? 0.35 : (duration + Math.random() * duration) / 1000
      objects.forEach((object, i) => {
        const target = list[i]
        gsap.to(object.position, {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z,
          duration: dur,
          ease: 'expo.inOut',
        })
        gsap.to(object.rotation, {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z,
          duration: dur,
          ease: 'expo.inOut',
        })
      })
    }

    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (!reduced) scene.rotation.y += 0.004
      controls.update()
      renderer.render(scene, camera)
    }
    tick()
    transformTo('table', reduced ? 400 : 1800)

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    const cycle = reduced
      ? null
      : window.setInterval(() => {
          setLayout((prev) => {
            const idx = LAYOUTS.findIndex((l) => l.id === prev)
            const next = LAYOUTS[(idx + 1) % LAYOUTS.length].id
            transformTo(next, 1400)
            return next
          })
        }, 9000)

    apiRef.current = { transformTo }

    return () => {
      if (cycle) window.clearInterval(cycle)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frame)
      controls.dispose()
      gsap.killTweensOf(objects.map((o) => o.position))
      gsap.killTweensOf(objects.map((o) => o.rotation))
      objects.forEach((obj) => {
        scene.remove(obj)
        obj.element.remove()
      })
      renderer.domElement.remove()
      apiRef.current = null
    }
  }, [])

  const switchLayout = (id) => {
    setLayout(id)
    apiRef.current?.transformTo(id, prefersReducedMotion() ? 400 : 1500)
  }

  return (
    <section className="scene album-scene album-wall-scene">
      <StoryBackground variant="soft" />
      <StoryCopy title="回忆照片墙" className="wall-copy" />

      <div ref={mountRef} className="wall-stage" />

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
        <div className="wall-preview" role="dialog" aria-label={preview.title}>
          <button type="button" className="wall-preview-close" onClick={() => setPreview(null)}>
            关闭
          </button>
          <img src={preview.src} alt={preview.title} />
          <h3>{preview.title}</h3>
          <p>{preview.caption}</p>
        </div>
      ) : null}
    </section>
  )
}

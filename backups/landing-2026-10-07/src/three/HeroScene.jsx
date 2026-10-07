import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, EdgesGeometry, IcosahedronGeometry, MathUtils, OctahedronGeometry } from 'three'
import { CHIPS, PANELS } from './codeSnippets'
import { createChipTexture, createCodePanelTexture } from './textures'

/*
 * "Code universe" hero scene.
 * Budget: ≤ 7 textured quads, ≤ 10 chips, 2 line meshes and one Points cloud —
 * a handful of draw calls. Rendering pauses when the hero is off-screen or the
 * tab is hidden.
 */

const LAYOUT = {
  full: {
    panels: [
      { i: 0, pos: [2.9, 1.55, -0.6], w: 2.5, rot: -0.16 },
      { i: 1, pos: [1.55, -0.2, 0.5], w: 2.9, rot: -0.08 },
      { i: 2, pos: [4.25, -0.75, -1.6], w: 2.6, rot: -0.24 },
      { i: 3, pos: [0.75, 1.95, -2.4], w: 2.1, rot: -0.05 },
      { i: 4, pos: [3.2, -2.25, 0.1], w: 2.2, rot: -0.14 },
      { i: 5, pos: [5.4, 1.2, -3.2], w: 2.0, rot: -0.3 },
      { i: 6, pos: [-0.2, -2.4, -2.8], w: 1.7, rot: 0.02 },
    ],
    chips: [
      [0.4, 0.95, 1.2], [4.6, 0.6, 0.6], [2.4, -1.35, 1.4], [5.6, -1.9, -0.8], [1.2, -1.45, -1.2],
      [3.7, 2.55, -1.2], [-0.5, 0.2, -1.5], [5.2, 2.6, -2.4], [2.2, 2.75, 0.2], [0.1, -0.9, 0.9],
    ],
    particles: 700,
  },
  lite: {
    panels: [
      { i: 0, pos: [2.6, 1.3, -0.6], w: 2.5, rot: -0.14 },
      { i: 1, pos: [1.6, -0.6, 0.4], w: 2.8, rot: -0.08 },
      { i: 3, pos: [4.0, -0.9, -1.8], w: 2.2, rot: -0.22 },
      { i: 4, pos: [3.4, -2.4, -0.4], w: 2.1, rot: -0.14 },
    ],
    chips: [[0.5, 0.9, 1.1], [4.4, 0.7, 0.5], [2.6, -1.6, 1.2], [4.9, 2.2, -1.5], [0.6, -1.9, -0.5], [2.9, 2.6, -0.8]],
    particles: 260,
  },
}

/**
 * Minimal adaptive resolution: samples the average frame time over ~2s and
 * drops the device-pixel-ratio when the GPU can't hold ~45fps.
 */
function AdaptiveDpr({ high, onChange }) {
  const sample = useRef({ frames: 0, time: 0, lowered: false })
  useFrame((_, delta) => {
    const s = sample.current
    s.frames += 1
    s.time += delta
    if (s.time < 2) return
    const fps = s.frames / s.time
    if (fps < 45 && !s.lowered) {
      s.lowered = true
      onChange(1)
    } else if (fps > 58 && s.lowered && high > 1) {
      s.lowered = false
      onChange(high)
    }
    s.frames = 0
    s.time = 0
  })
  return null
}

/** Pointer position normalised to [-1, 1], tracked on window (canvas ignores pointer events). */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return pointer
}

function FloatingQuad({ texture, aspect, width, position, rotation = 0, delay = 0, speed = 0.5, amplitude = 0.08, opacity = 1, phase = 0 }) {
  const ref = useRef(null)
  const material = useRef(null)
  const height = width / aspect

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Entrance: ease in over ~1.2s after `delay`.
    const appear = MathUtils.clamp((t - delay) / 1.2, 0, 1)
    const eased = 1 - Math.pow(1 - appear, 3)
    const mesh = ref.current
    mesh.position.y = position[1] + Math.sin(t * speed + phase) * amplitude
    mesh.position.z = position[2] - (1 - eased) * 1.5
    mesh.rotation.z = Math.sin(t * speed * 0.6 + phase) * 0.02
    mesh.scale.setScalar(0.85 + eased * 0.15)
    material.current.opacity = eased * opacity
  })

  return (
    <mesh ref={ref} position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={material} map={texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Particles({ count }) {
  const ref = useRef(null)
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = MathUtils.randFloatSpread(18) + 2
      positions[i * 3 + 1] = MathUtils.randFloatSpread(10)
      positions[i * 3 + 2] = MathUtils.randFloat(-8, 2)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    return geo
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.012
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.028} color="#b9c2d6" transparent opacity={0.55} sizeAttenuation depthWrite={false} blending={AdditiveBlending} />
    </points>
  )
}

function WireShape({ geometry, color, position, scale = 1, speed = 0.1, opacity = 0.3 }) {
  const ref = useRef(null)
  const edges = useMemo(() => new EdgesGeometry(geometry), [geometry])
  useEffect(() => () => {
    edges.dispose()
    geometry.dispose()
  }, [edges, geometry])

  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speed
    ref.current.rotation.y += delta * speed * 1.3
  })

  return (
    <lineSegments ref={ref} geometry={edges} position={position} scale={scale}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  )
}

function Rig({ children, pointer, scroll }) {
  const group = useRef(null)
  const { viewport } = useThree()
  // Shift the cluster left on narrower canvases so it stays in frame.
  const offsetX = viewport.width < 12 ? -(12 - viewport.width) * 0.45 : 0

  useFrame((_, delta) => {
    const g = group.current
    const damp = 1 - Math.pow(0.0015, delta)
    const s = scroll.current
    g.rotation.y = MathUtils.lerp(g.rotation.y, pointer.current.x * 0.12, damp)
    g.rotation.x = MathUtils.lerp(g.rotation.x, pointer.current.y * 0.07 + s * 0.25, damp)
    g.position.x = MathUtils.lerp(g.position.x, offsetX + pointer.current.x * 0.15, damp)
    g.position.y = MathUtils.lerp(g.position.y, s * 2.2, damp)
  })

  return <group ref={group}>{children}</group>
}

function SceneContent({ quality }) {
  const layout = LAYOUT[quality]
  const pointer = usePointer()
  const scroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scroll.current = MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1.2)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const panels = useMemo(
    () => layout.panels.map((p) => ({ ...p, ...createCodePanelTexture(PANELS[p.i], { scale: quality === 'full' ? 2 : 1.5 }) })),
    [layout, quality],
  )
  const chips = useMemo(
    () => layout.chips.map((pos, idx) => ({ pos, ...createChipTexture(CHIPS[idx % CHIPS.length], { scale: 2 }) })),
    [layout],
  )

  useEffect(
    () => () => {
      panels.forEach((p) => p.texture.dispose())
      chips.forEach((c) => c.texture.dispose())
    },
    [panels, chips],
  )

  const shapes = useMemo(
    () => (quality === 'full' ? [new IcosahedronGeometry(1, 1), new OctahedronGeometry(0.7, 0)] : [new IcosahedronGeometry(1, 0)]),
    [quality],
  )

  return (
    <Rig pointer={pointer} scroll={scroll}>
      {panels.map((p, idx) => (
        <FloatingQuad
          key={`panel-${p.i}`}
          texture={p.texture}
          aspect={p.aspect}
          width={p.w}
          position={p.pos}
          rotation={p.rot}
          delay={0.15 + idx * 0.12}
          speed={0.35 + (idx % 3) * 0.08}
          opacity={p.pos[2] < -2 ? 0.55 : 0.95}
          phase={idx * 1.9}
        />
      ))}
      {chips.map((c, idx) => (
        <FloatingQuad
          key={`chip-${idx}`}
          texture={c.texture}
          aspect={c.aspect}
          width={0.3 * c.aspect}
          position={c.pos}
          delay={0.6 + idx * 0.07}
          speed={0.55 + (idx % 4) * 0.1}
          amplitude={0.12}
          opacity={c.pos[2] < -1 ? 0.6 : 0.95}
          phase={idx * 2.3 + 0.7}
        />
      ))}
      <WireShape geometry={shapes[0]} color="#ff6a45" position={[5.6, -0.2, -4.5]} scale={1.5} opacity={0.22} speed={0.06} />
      {shapes[1] && <WireShape geometry={shapes[1]} color="#8fb1ff" position={[-0.6, 2.5, -4]} scale={1} opacity={0.25} speed={0.09} />}
      <Particles count={layout.particles} />
    </Rig>
  )
}

/**
 * Canvas wrapper. `active` pauses rendering (frameloop "never") when false.
 * Calls onFailure if the WebGL context is lost so the CSS fallback can take over.
 */
export default function HeroScene({ quality = 'full', active = true, onFailure }) {
  const [dpr, setDpr] = useState(quality === 'full' ? 1.5 : 1)

  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: 'none' }}
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: [0, 0, 8], fov: 42, near: 0.1, far: 40 }}
      gl={{ antialias: quality === 'full', alpha: true, powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onFailure?.()
        })
      }}
      aria-hidden="true"
    >
      {/* Drop resolution automatically if the device can't hold a smooth frame rate. */}
      <AdaptiveDpr high={quality === 'full' ? 1.5 : 1} onChange={setDpr} />
      <SceneContent quality={quality} />
    </Canvas>
  )
}

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, useProgress } from '@react-three/drei'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, MathUtils, Vector3 } from 'three'
import { damp } from '../../three/animations'
import { CAMERA, PARALLAX } from '../../three/camera'
import { ENVIRONMENT_PANELS, HOVER_RIM_BOOST, LIGHTS } from '../../three/lighting'
import { PALETTE, QUALITY } from '../../three/scene'
import { DeveloperAvatar } from './DeveloperAvatar'
import { FloatingTech } from './FloatingTech'

/*
 * The hero's WebGL scene, loaded as its own chunk. Nothing here depends on the
 * Laravel API, so API failures never affect the 3D hero.
 */

/** Pointer position normalised to [-1, 1] over the whole window. */
function usePointer(enabled) {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (!enabled) return undefined
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])
  return pointer
}

/** Subtle camera parallax with the pointer; always looking at the character's chest. */
function CameraRig({ pointerRef, motionEnabled }) {
  const target = useMemo(() => new Vector3(...CAMERA.target), [])
  useFrame(({ camera }, dt) => {
    const p = motionEnabled ? pointerRef.current : { x: 0, y: 0 }
    camera.position.x = damp(camera.position.x, CAMERA.position[0] + p.x * PARALLAX.x, 2.2, dt)
    camera.position.y = damp(camera.position.y, CAMERA.position[1] - p.y * PARALLAX.y, 2.2, dt)
    camera.lookAt(target)
  })
  return null
}

function Lighting({ cfg, hoveredRef }) {
  const purple = useRef(null)
  const blue = useRef(null)
  useFrame((_, dt) => {
    const boost = hoveredRef.current ? HOVER_RIM_BOOST : 1
    purple.current.intensity = damp(purple.current.intensity, LIGHTS.rimPurple.intensity * boost, 4, dt)
    blue.current.intensity = damp(blue.current.intensity, LIGHTS.rimBlue.intensity * boost, 4, dt)
  })

  const { key, fill, ambient, rimPurple, rimBlue } = LIGHTS
  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />
      <directionalLight
        position={key.position}
        intensity={key.intensity}
        color={key.color}
        castShadow={cfg.shadowMap > 0}
        shadow-mapSize={[cfg.shadowMap || 512, cfg.shadowMap || 512]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-0.8}
        shadow-camera-right={0.8}
        shadow-camera-top={2.2}
        shadow-camera-bottom={0.5}
        shadow-camera-near={0.5}
        shadow-camera-far={8}
      />
      {cfg.fill && <directionalLight position={fill.position} intensity={fill.intensity} color={fill.color} />}
      <pointLight ref={purple} position={rimPurple.position} intensity={rimPurple.intensity} distance={rimPurple.distance} color={rimPurple.color} />
      <pointLight ref={blue} position={rimBlue.position} intensity={rimBlue.intensity} distance={rimBlue.distance} color={rimBlue.color} />
      {cfg.environment && (
        <Environment resolution={128} frames={1}>
          {ENVIRONMENT_PANELS.map((panel, i) => (
            <Lightformer key={i} {...panel} />
          ))}
        </Environment>
      )}
    </>
  )
}

/** A few tiny dust motes drifting behind the character. */
function Particles({ count }) {
  const points = useRef(null)
  const geometry = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      positions.push(MathUtils.randFloatSpread(2.6), MathUtils.randFloat(0.5, 2.3), MathUtils.randFloat(-2.2, -0.4))
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(positions, 3))
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame((state, dt) => {
    points.current.rotation.y += dt * 0.015
    points.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
  })
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.012} color={PALETTE.accentBlue} transparent opacity={0.45} sizeAttenuation depthWrite={false} blending={AdditiveBlending} />
    </points>
  )
}

function ReportProgress({ onProgress }) {
  const { progress } = useProgress()
  useEffect(() => onProgress?.(progress), [progress, onProgress])
  return null
}

/** Mounted after the avatar resolves: signals the first rendered frame. */
function ReportReady({ onReady }) {
  useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.())
    return () => cancelAnimationFrame(id)
  }, [onReady])
  return null
}

export default function AvatarScene({ quality = 'full', motionEnabled = true, active = true, scrollProgress, entrance, onProgress, onReady, onFailure }) {
  const cfg = QUALITY[quality] ?? QUALITY.full
  const pointerRef = usePointer(motionEnabled)
  const hoveredRef = useRef(false)

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={cfg.dpr}
      shadows={cfg.shadowMap > 0 ? 'percentage' : false}
      frameloop={!active ? 'never' : motionEnabled ? 'always' : 'demand'}
      camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: CAMERA.position }}
      gl={{ antialias: cfg.antialias, alpha: true, powerPreference: 'high-performance', stencil: false }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onFailure?.(new Error('WebGL context lost'))
        })
      }}
      aria-label="Interactive 3D avatar of Ashwani, a developer in a navy blazer"
      role="img"
    >
      <ReportProgress onProgress={onProgress} />
      <CameraRig pointerRef={pointerRef} motionEnabled={motionEnabled} />
      <Lighting cfg={cfg} hoveredRef={hoveredRef} />
      {motionEnabled && <Particles count={cfg.particles} />}
      <FloatingTech count={cfg.tech} motionEnabled={motionEnabled} />
      <Suspense fallback={null}>
        <DeveloperAvatar
          pointerRef={pointerRef}
          hoveredRef={hoveredRef}
          scrollProgress={scrollProgress}
          entrance={entrance}
          motionEnabled={motionEnabled}
          shadows={cfg.shadowMap > 0}
        />
        <ReportReady onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}

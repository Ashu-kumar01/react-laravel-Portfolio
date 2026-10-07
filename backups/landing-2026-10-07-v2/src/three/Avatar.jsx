import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CanvasTexture, DoubleSide, LatheGeometry, MathUtils, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace, Vector2 } from 'three'
import { createChipTexture } from './textures'

/*
 * Stylised, fully procedural 3D portrait character (no model file to download):
 * brown skin, short dark hair with volume on top, trimmed beard, navy blazer over
 * an open-collar white shirt. Built in metres (~1.8 tall) and scaled by the parent.
 *
 * It never stands still: breathing, weight shift, idle sway, blinking, head/eyes
 * follow the pointer, and a gesture loop (wave + "explaining" hand) every 16s.
 */

const PALETTE = {
  skin: '#c48e6a',
  hair: '#141110',
  beard: '#2a201b',
  blazer: '#1e2d52',
  lapel: '#17233f',
  trousers: '#171e36',
  shirt: '#eef0f3',
  shoe: '#1a1412',
  eye: '#f3efe8',
  iris: '#2b1a10',
  lip: '#94594a',
  button: '#0e1424',
}

const TORSO_R = 0.165
// Blazer silhouette [radius, y] from the hem (covering the hips) up to the shoulder line, relative to the spine joint.
const TORSO_PROFILE = [
  [0.158, -0.22],
  [0.152, -0.05],
  [0.148, 0.08],
  [0.162, 0.26],
  [0.165, 0.4],
  [0.158, 0.47],
]
const torsoRadiusAt = (y) => {
  for (let i = 1; i < TORSO_PROFILE.length; i++) {
    const [r1, y1] = TORSO_PROFILE[i]
    const [r0, y0] = TORSO_PROFILE[i - 1]
    if (y <= y1) return MathUtils.lerp(r0, r1, MathUtils.clamp((y - y0) / (y1 - y0), 0, 1))
  }
  return TORSO_PROFILE.at(-1)[0]
}

/** A strip of geometry lying on the torso cylinder; xRange(v) gives its [left, right] edge at height fraction v. */
function torsoPatch(y0, y1, xRange, lift = 0.003) {
  const geo = new PlaneGeometry(1, 1, 8, 14)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) + 0.5
    const v = pos.getY(i) + 0.5
    const [x0, x1] = xRange(v)
    const x = MathUtils.lerp(x0, x1, u)
    const y = MathUtils.lerp(y0, y1, v)
    const r = torsoRadiusAt(y) + lift
    pos.setXYZ(i, x, y, Math.sqrt(Math.max(r * r - x * x, 0)))
  }
  geo.computeVertexNormals()
  return geo
}

function gradientTexture(draw, w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d'), w, h)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

const smooth = (a, b, x) => MathUtils.smoothstep(x, a, b)
/** 0 → 1 → 0 envelope between a and b with `fade` seconds of easing on each side. */
const window01 = (x, a, b, fade) => smooth(a, a + fade, x) * (1 - smooth(b - fade, b, x))
const damp = (current, target, k) => current + (target - current) * k

function Limb({ side, shoulderRef, elbowRef, wristRef }) {
  // side: -1 = character's right (screen left), +1 = character's left
  return (
    <group ref={shoulderRef} position={[side * 0.205, 0.43, 0]}>
      <mesh position={[0, -0.13, 0]}>
        <capsuleGeometry args={[0.052, 0.2, 6, 14]} />
        <meshStandardMaterial color={PALETTE.blazer} roughness={0.62} />
      </mesh>
      <group ref={elbowRef} position={[0, -0.27, 0]}>
        {/* elbow ball hides the seam between the two sleeve segments */}
        <mesh>
          <sphereGeometry args={[0.049, 14, 10]} />
          <meshStandardMaterial color={PALETTE.blazer} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <capsuleGeometry args={[0.047, 0.19, 6, 14]} />
          <meshStandardMaterial color={PALETTE.blazer} roughness={0.62} />
        </mesh>
        {/* shirt cuff peeking out of the sleeve */}
        <mesh position={[0, -0.245, 0]}>
          <cylinderGeometry args={[0.044, 0.044, 0.026, 16]} />
          <meshStandardMaterial color={PALETTE.shirt} roughness={0.5} />
        </mesh>
        <group ref={wristRef} position={[0, -0.265, 0]}>
          <mesh position={[0, -0.045, 0]} scale={[0.72, 1.15, 0.5]}>
            <sphereGeometry args={[0.042, 16, 12]} />
            <meshStandardMaterial color={PALETTE.skin} roughness={0.55} />
          </mesh>
          <mesh position={[-side * 0.022, -0.03, 0.018]} rotation={[0.4, 0, side * 0.5]}>
            <capsuleGeometry args={[0.012, 0.028, 4, 8]} />
            <meshStandardMaterial color={PALETTE.skin} roughness={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Leg({ side, hipRef, kneeRef }) {
  return (
    <group ref={hipRef} position={[side * 0.095, -0.02, 0]}>
      <mesh position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.076, 0.3, 6, 14]} />
        <meshStandardMaterial color={PALETTE.trousers} roughness={0.7} />
      </mesh>
      <group ref={kneeRef} position={[0, -0.44, 0]}>
        <mesh>
          <sphereGeometry args={[0.068, 14, 10]} />
          <meshStandardMaterial color={PALETTE.trousers} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.064, 0.3, 6, 14]} />
          <meshStandardMaterial color={PALETTE.trousers} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.415, 0.045]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.75]}>
          <capsuleGeometry args={[0.05, 0.13, 6, 12]} />
          <meshStandardMaterial color={PALETTE.shoe} roughness={0.32} metalness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

export function Avatar({ position = [0, 0, 0], scale = 1, facing = -0.3, pointer, greeting }) {
  const body = useRef(null)
  const turn = useRef(null)
  const hips = useRef(null)
  const spine = useRef(null)
  const chest = useRef(null)
  const neck = useRef(null)
  const head = useRef(null)
  const eyes = useRef(null)
  const irises = useRef(null)
  const bubble = useRef(null)
  const scan = useRef(null)
  const pulse = useRef(null)
  const glow = useRef(null)
  const ringA = useRef(null)
  const ringB = useRef(null)
  // Joints: R = character's right (screen left), L = character's left.
  const shoulderR = useRef(null)
  const elbowR = useRef(null)
  const wristR = useRef(null)
  const shoulderL = useRef(null)
  const elbowL = useRef(null)
  const wristL = useRef(null)
  const hipR = useRef(null)
  const kneeR = useRef(null)
  const hipL = useRef(null)
  const kneeL = useRef(null)

  const geo = useMemo(() => {
    const vHalf = (v) => 0.082 * v
    const lapel = (v) => 0.014 + 0.036 * v
    return {
      torso: new LatheGeometry(TORSO_PROFILE.map(([r, y]) => new Vector2(r, y)), 40),
      shirt: torsoPatch(0.16, 0.472, (v) => [-vHalf(v), vHalf(v)]),
      lapelR: torsoPatch(0.15, 0.472, (v) => [-vHalf(v) - lapel(v), -vHalf(v) + 0.004], 0.006),
      lapelL: torsoPatch(0.15, 0.472, (v) => [vHalf(v) - 0.004, vHalf(v) + lapel(v)], 0.006),
    }
  }, [])

  const fx = useMemo(() => {
    const glow = gradientTexture((ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
      g.addColorStop(0, 'rgba(255,138,104,0.9)')
      g.addColorStop(0.35, 'rgba(255,106,69,0.35)')
      g.addColorStop(1, 'rgba(255,106,69,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }, 256, 256)
    const beam = gradientTexture((ctx, w, h) => {
      const g = ctx.createLinearGradient(0, h, 0, 0)
      g.addColorStop(0, 'rgba(255,120,85,0.55)')
      g.addColorStop(0.5, 'rgba(143,177,255,0.12)')
      g.addColorStop(1, 'rgba(143,177,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }, 8, 128)
    const additive = (opts) => new MeshBasicMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false, ...opts })
    return {
      glow,
      beam,
      glowMat: additive({ map: glow, opacity: 0.85 }),
      beamMat: additive({ map: beam, opacity: 0.32, side: DoubleSide }),
      ringA: additive({ color: '#ff6a45', opacity: 0.75, side: DoubleSide }),
      ringB: additive({ color: '#8fb1ff', opacity: 0.55, side: DoubleSide }),
      pulse: additive({ color: '#ff8a68', opacity: 0.5, side: DoubleSide }),
      scan: additive({ color: '#ff8a68', opacity: 0 }),
    }
  }, [])

  const bubbleTex = useMemo(() => (greeting ? createChipTexture({ label: greeting, dot: '#ff6a45' }, { scale: 2 }) : null), [greeting])

  const mats = useMemo(
    () => ({
      skin: new MeshStandardMaterial({ color: PALETTE.skin, roughness: 0.55 }),
      hair: new MeshStandardMaterial({ color: PALETTE.hair, roughness: 0.72 }),
      beard: new MeshStandardMaterial({ color: PALETTE.beard, roughness: 0.95 }),
      blazer: new MeshStandardMaterial({ color: PALETTE.blazer, roughness: 0.62 }),
      lapel: new MeshStandardMaterial({ color: PALETTE.lapel, roughness: 0.38, side: DoubleSide }),
      trousers: new MeshStandardMaterial({ color: PALETTE.trousers, roughness: 0.7 }),
      shirt: new MeshStandardMaterial({ color: PALETTE.shirt, roughness: 0.5, side: DoubleSide }),
      eye: new MeshStandardMaterial({ color: PALETTE.eye, roughness: 0.25 }),
      iris: new MeshStandardMaterial({ color: PALETTE.iris, roughness: 0.2 }),
      lip: new MeshStandardMaterial({ color: PALETTE.lip, roughness: 0.6 }),
      button: new MeshStandardMaterial({ color: PALETTE.button, roughness: 0.3, metalness: 0.3 }),
    }),
    [],
  )

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose())
      Object.values(mats).forEach((m) => m.dispose())
      Object.values(fx).forEach((o) => o.dispose())
      bubbleTex?.texture.dispose()
    },
    [geo, mats, fx, bubbleTex],
  )

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const k = 1 - Math.pow(0.004, delta)
    const p = pointer?.current ?? { x: 0, y: 0 }

    // Entrance: rise up out of the platform.
    const intro = 1 - Math.pow(1 - MathUtils.clamp((t - 0.15) / 1.6, 0, 1), 3)
    body.current.position.y = -(1 - intro) * 0.55
    body.current.scale.setScalar(0.9 + intro * 0.1)

    // Gesture loop (16s): wave hello, later an "explaining" open hand.
    const g = t > 1.4 ? (t - 1.4) % 16 : -1
    const wave = window01(g, 0, 3.6, 0.55)
    const explain = window01(g, 8, 11.6, 0.7)

    // Breathing + idle weight shift.
    const breath = Math.sin(t * 1.7)
    const sway = Math.sin(t * 0.55)
    chest.current.scale.set(1 + breath * 0.01, 1 + breath * 0.008, 1 + breath * 0.025)
    hips.current.position.x = sway * 0.012
    hips.current.rotation.z = sway * 0.022
    spine.current.rotation.z = -sway * 0.03 + wave * 0.04
    spine.current.rotation.y = Math.sin(t * 0.35) * 0.06 - explain * 0.12
    spine.current.rotation.x = -0.02 + breath * 0.008

    const bendR = 0.05 + Math.max(0, -sway) * 0.1
    const bendL = 0.05 + Math.max(0, sway) * 0.1
    hipR.current.rotation.set(-bendR * 0.5, 0, -sway * 0.022)
    hipL.current.rotation.set(-bendL * 0.5, 0, -sway * 0.022)
    kneeR.current.rotation.x = bendR
    kneeL.current.rotation.x = bendL

    // Character's right arm: idle ↔ wave.
    const idleSwing = Math.sin(t * 0.9) * 0.03
    shoulderR.current.position.y = 0.43 + breath * 0.004
    // Upper arm out at ~35° above horizontal, forearm swinging around vertical.
    shoulderR.current.rotation.z = MathUtils.lerp(-0.1 - sway * 0.02, -2.2, wave)
    shoulderR.current.rotation.x = MathUtils.lerp(-0.05 + idleSwing, -0.2, wave)
    elbowR.current.rotation.x = MathUtils.lerp(-0.3 - idleSwing, -0.1, wave)
    elbowR.current.rotation.z = MathUtils.lerp(0, -0.85 + Math.sin(t * 9) * 0.38, wave)
    wristR.current.rotation.z = MathUtils.lerp(0.05, Math.sin(t * 9 - 0.6) * 0.25, wave)

    // Character's left arm: idle ↔ explaining open hand.
    const talk = Math.sin(t * 3.2) * 0.08
    shoulderL.current.position.y = 0.43 + breath * 0.004
    shoulderL.current.rotation.z = MathUtils.lerp(0.1 - sway * 0.02, 0.28, explain)
    shoulderL.current.rotation.x = MathUtils.lerp(-0.05 - idleSwing, -0.4 + talk * 0.5, explain)
    elbowL.current.rotation.x = MathUtils.lerp(-0.3 + idleSwing, -1.35 + talk, explain)
    elbowL.current.rotation.z = MathUtils.lerp(0, -0.15, explain)
    wristL.current.rotation.y = MathUtils.lerp(0, -1.1, explain)

    // Head and eyes follow the pointer; look at the viewer while waving.
    const yaw = MathUtils.lerp(p.x * 0.55 - facing * 0.9, -facing, wave)
    const pitch = MathUtils.lerp(p.y * 0.22 + 0.05, 0.08, wave) + Math.sin(t * 0.8) * 0.02
    neck.current.rotation.y = damp(neck.current.rotation.y, yaw * 0.4, k)
    neck.current.rotation.x = damp(neck.current.rotation.x, pitch * 0.4, k)
    head.current.rotation.y = damp(head.current.rotation.y, yaw * 0.6, k)
    head.current.rotation.x = damp(head.current.rotation.x, pitch * 0.6 + explain * Math.sin(t * 3.2) * 0.03, k)
    head.current.rotation.z = Math.sin(t * 0.45) * 0.03 + wave * 0.09
    irises.current.position.x = damp(irises.current.position.x, p.x * 0.0035, k)
    irises.current.position.y = damp(irises.current.position.y, -p.y * 0.0025, k)

    const blinkT = t % 4.6
    eyes.current.scale.y = blinkT < 0.07 || (blinkT > 0.22 && blinkT < 0.29 && Math.floor(t / 4.6) % 3 === 0) ? 0.12 : 1

    // Speech bubble pops in with the wave.
    if (bubble.current) {
      const pop = MathUtils.clamp(wave * 1.4, 0, 1)
      bubble.current.material.opacity = pop
      bubble.current.scale.setScalar(0.6 + 0.4 * (1 - Math.pow(1 - pop, 3)))
      bubble.current.position.y = 1.98 + Math.sin(t * 2) * 0.012
      bubble.current.visible = pop > 0.01
    }

    // Platform + hologram effects.
    ringA.current.rotation.z += delta * 0.4
    ringB.current.rotation.z -= delta * 0.25
    const pt = (t % 2.6) / 2.6
    pulse.current.scale.setScalar(1 + pt * 0.9)
    pulse.current.material.opacity = (1 - pt) * 0.45
    const st = (t % 6) / 6
    scan.current.position.y = 0.05 + st * 1.85
    scan.current.material.opacity = Math.sin(st * Math.PI) * 0.55
    glow.current.material.opacity = 0.7 + Math.sin(t * 1.4) * 0.15
  })

  return (
    <group position={position} scale={scale}>
      {/* Platform */}
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} material={fx.glowMat}>
        <planeGeometry args={[1.5, 1.5]} />
      </mesh>
      <mesh ref={ringA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={fx.ringA}>
        <ringGeometry args={[0.43, 0.442, 72, 1, 0, Math.PI * 1.6]} />
      </mesh>
      <mesh ref={ringB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={fx.ringB}>
        <ringGeometry args={[0.52, 0.526, 72, 1, 0, Math.PI * 1.15]} />
      </mesh>
      <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} material={fx.pulse}>
        <ringGeometry args={[0.4, 0.408, 72]} />
      </mesh>
      <mesh position={[0, 1.0, 0]} material={fx.beamMat}>
        <cylinderGeometry args={[0.36, 0.5, 2.0, 40, 1, true]} />
      </mesh>
      <mesh ref={scan} rotation={[Math.PI / 2, 0, 0]} material={fx.scan}>
        <torusGeometry args={[0.36, 0.0045, 6, 72]} />
      </mesh>

      {bubbleTex && (
        <mesh ref={bubble} position={[0.42, 1.98, 0.15]} visible={false}>
          <planeGeometry args={[0.09 * bubbleTex.aspect, 0.09]} />
          <meshBasicMaterial map={bubbleTex.texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      )}

      <group ref={turn} rotation={[0, facing, 0]}>
        <group ref={body}>
          <group ref={hips} position={[0, 0.98, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.72]} material={mats.trousers}>
              <capsuleGeometry args={[0.125, 0.1, 6, 16]} />
            </mesh>
            <Leg side={-1} hipRef={hipR} kneeRef={kneeR} />
            <Leg side={1} hipRef={hipL} kneeRef={kneeL} />

            <group ref={spine} position={[0, 0.05, 0]}>
              <group ref={chest}>
                <group scale={[1, 1, 0.68]}>
                  <mesh geometry={geo.torso} material={mats.blazer} />
                  {/* shoulder line */}
                  <mesh position={[0, 0.455, 0]} scale={[1.36, 0.36, 1]} material={mats.blazer}>
                    <sphereGeometry args={[TORSO_R, 28, 16]} />
                  </mesh>
                  <mesh geometry={geo.shirt} material={mats.shirt} />
                  <mesh geometry={geo.lapelR} material={mats.lapel} />
                  <mesh geometry={geo.lapelL} material={mats.lapel} />
                  <mesh position={[0, 0.115, torsoRadiusAt(0.115) + 0.004]} material={mats.button}>
                    <sphereGeometry args={[0.011, 10, 8]} />
                  </mesh>
                  {/* pocket square */}
                  <mesh position={[0.094, 0.37, 0.138]} rotation={[0, 0.62, 0]} material={mats.shirt}>
                    <boxGeometry args={[0.05, 0.018, 0.006]} />
                  </mesh>
                </group>
              </group>

              <Limb side={-1} shoulderRef={shoulderR} elbowRef={elbowR} wristRef={wristR} />
              <Limb side={1} shoulderRef={shoulderL} elbowRef={elbowL} wristRef={wristL} />

              <group ref={neck} position={[0, 0.47, 0]}>
                <mesh position={[0, 0.05, 0]} material={mats.skin}>
                  <cylinderGeometry args={[0.048, 0.054, 0.12, 16]} />
                </mesh>
                {/* open shirt collar */}
                <mesh position={[0, 0.02, -0.004]} rotation={[Math.PI / 2, 0, Math.PI / 2 + 0.55]} material={mats.shirt}>
                  <torusGeometry args={[0.062, 0.015, 8, 28, Math.PI * 2 - 1.1]} />
                </mesh>
                <mesh position={[-0.042, 0.012, 0.05]} rotation={[-0.35, 0, 0.65]} material={mats.shirt}>
                  <boxGeometry args={[0.05, 0.036, 0.006]} />
                </mesh>
                <mesh position={[0.042, 0.012, 0.05]} rotation={[-0.35, 0, -0.65]} material={mats.shirt}>
                  <boxGeometry args={[0.05, 0.036, 0.006]} />
                </mesh>

                <group ref={head} position={[0, 0.11, 0]} scale={1.1}>
                  {/* skull + jaw */}
                  <mesh position={[0, 0.1, 0]} scale={[0.88, 1.08, 0.97]} material={mats.skin}>
                    <sphereGeometry args={[0.1, 32, 24]} />
                  </mesh>
                  <mesh position={[0, 0.055, 0.01]} scale={[0.9, 0.82, 0.95]} material={mats.skin}>
                    <sphereGeometry args={[0.085, 28, 20]} />
                  </mesh>
                  {/* ears */}
                  {[-1, 1].map((s) => (
                    <mesh key={s} position={[s * 0.087, 0.1, -0.006]} scale={[0.45, 1, 0.75]} material={mats.skin}>
                      <sphereGeometry args={[0.024, 12, 10]} />
                    </mesh>
                  ))}
                  {/* nose */}
                  <mesh position={[0, 0.09, 0.097]} scale={[0.72, 0.95, 0.9]} material={mats.skin}>
                    <sphereGeometry args={[0.02, 14, 10]} />
                  </mesh>
                  <mesh position={[0, 0.112, 0.094]} rotation={[0.25, 0, 0]} material={mats.skin}>
                    <capsuleGeometry args={[0.009, 0.026, 4, 8]} />
                  </mesh>
                  {/* eyes */}
                  <group ref={eyes} position={[0, 0.118, 0]}>
                    {[-1, 1].map((s) => (
                      <mesh key={s} position={[s * 0.034, 0, 0.08]} material={mats.eye}>
                        <sphereGeometry args={[0.0118, 14, 10]} />
                      </mesh>
                    ))}
                    <group ref={irises}>
                      {[-1, 1].map((s) => (
                        <mesh key={s} position={[s * 0.034, 0, 0.0895]} material={mats.iris}>
                          <sphereGeometry args={[0.0068, 12, 8]} />
                        </mesh>
                      ))}
                    </group>
                  </group>
                  {/* brows */}
                  {[-1, 1].map((s) => (
                    <mesh key={s} position={[s * 0.035, 0.141, 0.087]} rotation={[-0.2, s * 0.18, s * -0.1]} material={mats.hair}>
                      <boxGeometry args={[0.036, 0.009, 0.01]} />
                    </mesh>
                  ))}
                  {/* trimmed beard, moustache, sideburns, lips */}
                  {/* thin shell hugging the jaw = short, trimmed beard */}
                  <mesh position={[0, 0.055, 0.01]} scale={[0.9, 0.82, 0.95]} material={mats.beard}>
                    <sphereGeometry args={[0.0885, 32, 16, -0.3, Math.PI + 0.6, 1.38, Math.PI - 1.38]} />
                  </mesh>
                  <mesh position={[0, 0.068, 0.096]} rotation={[0, 0, Math.PI / 2]} material={mats.beard}>
                    <capsuleGeometry args={[0.0075, 0.034, 4, 8]} />
                  </mesh>
                  <mesh position={[0, 0.056, 0.098]} rotation={[0, 0, Math.PI / 2]} material={mats.lip}>
                    <capsuleGeometry args={[0.005, 0.02, 4, 8]} />
                  </mesh>
                  {[-1, 1].map((s) => (
                    <mesh key={s} position={[s * 0.083, 0.088, 0.012]} rotation={[0.15, 0, s * 0.08]} material={mats.beard}>
                      <capsuleGeometry args={[0.011, 0.05, 4, 8]} />
                    </mesh>
                  ))}
                  {/* hair: cap, nape and a swept quiff for volume on top */}
                  <mesh position={[0, 0.108, -0.004]} rotation={[-0.45, 0, 0]} scale={[0.9, 1.04, 1]} material={mats.hair}>
                    <sphereGeometry args={[0.106, 32, 16, 0, Math.PI * 2, 0, 1.25]} />
                  </mesh>
                  <mesh position={[0, 0.1, -0.006]} scale={[0.9, 1.06, 0.98]} material={mats.hair}>
                    <sphereGeometry args={[0.103, 24, 12, Math.PI, Math.PI, 1.0, 0.95]} />
                  </mesh>
                  <mesh position={[0.005, 0.203, 0.022]} rotation={[-0.25, 0, -0.08]} scale={[1.15, 0.5, 1.05]} material={mats.hair}>
                    <sphereGeometry args={[0.075, 24, 14]} />
                  </mesh>
                  <mesh position={[-0.028, 0.208, 0.056]} rotation={[-0.2, 0, 0.3]} scale={[1.3, 0.45, 1]} material={mats.hair}>
                    <sphereGeometry args={[0.05, 20, 12]} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

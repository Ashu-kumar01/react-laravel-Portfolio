import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, DoubleSide, LatheGeometry, MathUtils, MeshPhysicalMaterial, PlaneGeometry, TubeGeometry, Vector2, Vector3 } from 'three'
import { PALETTE } from '../../three/scene'

/*
 * Stylised professional developer, built procedurally (no download): short groomed
 * black hair, light stubble, white open-collar shirt and a navy blazer.
 * Metres, feet at y = 0. Framed waist-up by the camera, so detail goes into the face
 * and upper body. Exposes chest/neck/head nodes + a blink setter through `rig`.
 */

// Blazer silhouette [radius, y] from the hem up to the shoulder line, relative to the spine joint.
const TORSO_PROFILE = [
  [0.152, -0.22],
  [0.147, -0.06],
  [0.143, 0.08],
  [0.158, 0.26],
  [0.162, 0.39],
  [0.15, 0.47],
]
const TORSO_DEPTH = 0.7 // torso is an ellipse in plan view

const torsoRadiusAt = (y) => {
  for (let i = 1; i < TORSO_PROFILE.length; i++) {
    const [r0, y0] = TORSO_PROFILE[i - 1]
    const [r1, y1] = TORSO_PROFILE[i]
    if (y <= y1) return MathUtils.lerp(r0, r1, MathUtils.clamp((y - y0) / (y1 - y0), 0, 1))
  }
  return TORSO_PROFILE.at(-1)[0]
}

/** A strip lying on the torso surface; xRange(v) gives its [left, right] edges at height fraction v. */
function torsoPatch(y0, y1, xRange, lift = 0.003) {
  const geo = new PlaneGeometry(1, 1, 8, 16)
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

/** One continuous sleeve from shoulder into the trouser pocket (relaxed, hands-in-pockets pose). */
function sleeve(side) {
  const curve = new CatmullRomCurve3([
    new Vector3(side * 0.17, 0.43, 0),
    new Vector3(side * 0.198, 0.3, 0),
    new Vector3(side * 0.208, 0.16, 0.02),
    new Vector3(side * 0.19, 0.03, 0.065),
    new Vector3(side * 0.152, -0.07, 0.085),
  ])
  return { geometry: new TubeGeometry(curve, 48, 0.046, 18, false), end: curve.getPoint(1) }
}

const physical = (opts) => new MeshPhysicalMaterial(opts)

export function ProceduralAvatar({ rigRef }) {
  const chest = useRef(null)
  const neck = useRef(null)
  const head = useRef(null)
  const eyes = useRef(null)

  const geo = useMemo(() => {
    const vHalf = (v) => 0.078 * Math.pow(v, 0.95)
    const lapel = (v) => 0.016 + 0.034 * v
    return {
      torso: new LatheGeometry(TORSO_PROFILE.map(([r, y]) => new Vector2(r, y)), 48),
      shirt: torsoPatch(0.15, 0.472, (v) => [-vHalf(v), vHalf(v)]),
      lapelR: torsoPatch(0.14, 0.472, (v) => [-vHalf(v) - lapel(v), -vHalf(v) + 0.004], 0.006),
      lapelL: torsoPatch(0.14, 0.472, (v) => [vHalf(v) - 0.004, vHalf(v) + lapel(v)], 0.006),
      armR: sleeve(-1),
      armL: sleeve(1),
    }
  }, [])

  const mat = useMemo(
    () => ({
      skin: physical({ color: PALETTE.skin, roughness: 0.48, sheen: 0.35, sheenColor: '#ffcfb3', sheenRoughness: 0.6 }),
      hair: physical({ color: PALETTE.hair, roughness: 0.5, sheen: 0.5, sheenColor: '#4a4a5c', sheenRoughness: 0.4 }),
      stubble: physical({ color: PALETTE.stubble, roughness: 1, transparent: true, opacity: 0.52 }),
      blazer: physical({ color: PALETTE.blazer, roughness: 0.74, sheen: 0.7, sheenColor: '#40568f', sheenRoughness: 0.55 }),
      lapel: physical({ color: PALETTE.lapel, roughness: 0.42, sheen: 0.4, sheenColor: '#5a6ea8', side: DoubleSide }),
      trousers: physical({ color: PALETTE.trousers, roughness: 0.8, sheen: 0.4, sheenColor: '#36456e' }),
      shirt: physical({ color: PALETTE.shirt, roughness: 0.55, sheen: 0.25, sheenColor: '#ffffff', side: DoubleSide }),
      eye: physical({ color: PALETTE.eye, roughness: 0.2, clearcoat: 1 }),
      iris: physical({ color: PALETTE.iris, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }),
      lip: physical({ color: PALETTE.lip, roughness: 0.5, sheen: 0.3 }),
      button: physical({ color: '#0d1322', roughness: 0.3, metalness: 0.2, clearcoat: 0.6 }),
    }),
    [],
  )

  useEffect(() => {
    rigRef.current = {
      chest: chest.current,
      neck: neck.current,
      head: head.current,
      procedural: true,
      setBlink: (amount) => {
        if (eyes.current) eyes.current.scale.y = 1 - amount * 0.9
      },
    }
    return () => {
      rigRef.current = null
    }
  }, [rigRef])

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => (g.geometry ?? g).dispose())
      Object.values(mat).forEach((m) => m.dispose())
    },
    [geo, mat],
  )

  return (
    <group name="procedural-avatar">
      {/* hips (mostly under the blazer hem, faded out by the canvas mask) */}
      <mesh position={[0, 0.9, 0]} scale={[1, 1, TORSO_DEPTH]} material={mat.trousers}>
        <cylinderGeometry args={[0.136, 0.142, 0.2, 32]} />
      </mesh>

      <group position={[0, 1.03, 0]}>
        <group ref={chest}>
          {/* torso */}
          <group scale={[1, 1, TORSO_DEPTH]}>
            <mesh geometry={geo.torso} material={mat.blazer} />
            <mesh geometry={geo.shirt} material={mat.shirt} />
            <mesh geometry={geo.lapelR} material={mat.lapel} />
            <mesh geometry={geo.lapelL} material={mat.lapel} />
            <mesh position={[0, 0.112, torsoRadiusAt(0.112) + 0.004]} material={mat.button}>
              <sphereGeometry args={[0.0105, 12, 8]} />
            </mesh>
            {/* pocket square */}
            <mesh position={[0.09, 0.355, 0.134]} rotation={[0, 0.62, 0]} material={mat.shirt}>
              <boxGeometry args={[0.046, 0.016, 0.005]} />
            </mesh>
          </group>

          {/* natural shoulder line */}
          <mesh position={[0, 0.432, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]} material={mat.blazer}>
            <capsuleGeometry args={[0.058, 0.23, 8, 20]} />
          </mesh>

          {/* arms: continuous sleeves ending in the pockets (rounded cuff end) */}
          {[geo.armR, geo.armL].map((arm, i) => (
            <group key={i}>
              <mesh geometry={arm.geometry} material={mat.blazer} />
              <mesh position={arm.end} material={mat.blazer}>
                <sphereGeometry args={[0.046, 18, 14]} />
              </mesh>
            </group>
          ))}

          {/* neck, collars and head */}
          <group ref={neck} position={[0, 0.47, 0]}>
            <mesh position={[0, 0.035, 0]} material={mat.skin}>
              <cylinderGeometry args={[0.05, 0.056, 0.1, 20]} />
            </mesh>
            <mesh position={[0, 0.03, -0.004]} rotation={[Math.PI / 2, 0, Math.PI / 2 + 0.55]} material={mat.shirt}>
              <torusGeometry args={[0.06, 0.014, 10, 32, Math.PI * 2 - 1.1]} />
            </mesh>
            <mesh position={[0, 0.012, -0.012]} rotation={[Math.PI / 2, 0, Math.PI / 2 + 1.25]} material={mat.blazer}>
              <torusGeometry args={[0.076, 0.017, 10, 32, Math.PI * 2 - 2.5]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.038, 0.022, 0.05]} rotation={[-0.35, s * 0.15, s * -0.65]} material={mat.shirt}>
                <boxGeometry args={[0.046, 0.034, 0.005]} />
              </mesh>
            ))}

            {/* head is scaled up slightly: a premium stylised proportion, still adult (not chibi) */}
            <group ref={head} position={[0, 0.062, 0]} scale={1.12}>
              {/* cranium + lower face */}
              <mesh position={[0, 0.115, -0.005]} scale={[0.82, 1, 0.95]} material={mat.skin}>
                <sphereGeometry args={[0.1, 40, 32]} />
              </mesh>
              <mesh position={[0, 0.055, 0.012]} scale={[0.84, 0.86, 0.94]} material={mat.skin}>
                <sphereGeometry args={[0.08, 36, 28]} />
              </mesh>
              {/* ears */}
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.08, 0.105, -0.008]} scale={[0.32, 0.85, 0.6]} material={mat.skin}>
                  <sphereGeometry args={[0.028, 16, 12]} />
                </mesh>
              ))}
              {/* nose */}
              <mesh position={[0, 0.1, 0.091]} rotation={[-0.32, 0, 0]} material={mat.skin}>
                <capsuleGeometry args={[0.0082, 0.03, 6, 10]} />
              </mesh>
              <mesh position={[0, 0.082, 0.098]} scale={[1.05, 0.85, 0.95]} material={mat.skin}>
                <sphereGeometry args={[0.0122, 16, 12]} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.0115, 0.079, 0.091]} material={mat.skin}>
                  <sphereGeometry args={[0.0075, 12, 8]} />
                </mesh>
              ))}
              {/* eyes with relaxed upper lids (blink scales this group) */}
              <group ref={eyes} position={[0, 0.112, 0]}>
                {[-1, 1].map((s) => (
                  <group key={s} position={[s * 0.032, 0, 0.0785]}>
                    <mesh material={mat.eye}>
                      <sphereGeometry args={[0.0112, 18, 14]} />
                    </mesh>
                    <mesh position={[0, -0.0005, 0.0075]} material={mat.iris}>
                      <sphereGeometry args={[0.0066, 16, 12]} />
                    </mesh>
                    <mesh rotation={[0.32, 0, 0]} material={mat.skin}>
                      <sphereGeometry args={[0.0124, 18, 10, 0, Math.PI * 2, 0, 0.95]} />
                    </mesh>
                    <mesh rotation={[-0.35, 0, 0]} material={mat.skin}>
                      <sphereGeometry args={[0.0114, 18, 6, 0, Math.PI * 2, Math.PI - 0.7, 0.7]} />
                    </mesh>
                  </group>
                ))}
              </group>
              {/* brows: inner ends slightly raised for a calm, friendly look */}
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.034, 0.138, 0.081]} rotation={[0, s * 0.25, Math.PI / 2 - s * 0.08]} material={mat.hair}>
                  <capsuleGeometry args={[0.0045, 0.026, 4, 8]} />
                </mesh>
              ))}
              {/* light stubble, moustache, sideburns */}
              <mesh position={[0, 0.055, 0.012]} scale={[0.84, 0.86, 0.94]} material={mat.stubble}>
                <sphereGeometry args={[0.0815, 36, 18, -0.4, Math.PI + 0.8, 1.25, Math.PI - 1.25]} />
              </mesh>
              <mesh position={[0, 0.0665, 0.0905]} rotation={[0, 0, Math.PI / 2]} material={mat.stubble}>
                <capsuleGeometry args={[0.0055, 0.03, 4, 8]} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.077, 0.096, 0.004]} rotation={[0.12, 0, s * 0.06]} material={mat.hair}>
                  <capsuleGeometry args={[0.008, 0.032, 4, 8]} />
                </mesh>
              ))}
              {/* lips with a slight, friendly smile */}
              <mesh position={[0, 0.0595, 0.0915]} rotation={[0, 0, Math.PI / 2]} material={mat.lip}>
                <capsuleGeometry args={[0.0042, 0.024, 4, 10]} />
              </mesh>
              <mesh position={[0, 0.053, 0.0898]} rotation={[0, 0, Math.PI / 2]} material={mat.lip}>
                <capsuleGeometry args={[0.0048, 0.02, 4, 10]} />
              </mesh>
              <mesh position={[0, 0.0655, 0.0905]} rotation={[0.15, 0, Math.PI * 1.5 - 0.8]} material={mat.lip}>
                <torusGeometry args={[0.0165, 0.0018, 6, 20, 1.6]} />
              </mesh>
              {/* short, groomed hair: cap, nape and a soft swept quiff */}
              {/* cap reaches the temples just above the ears; front hairline sits ~3.5 cm above the brows */}
              <mesh position={[0, 0.118, -0.006]} rotation={[-0.32, 0, 0]} scale={[0.86, 1, 0.98]} material={mat.hair}>
                <sphereGeometry args={[0.106, 40, 20, 0, Math.PI * 2, 0, 1.35]} />
              </mesh>
              <mesh position={[0, 0.112, -0.01]} scale={[0.85, 1.02, 0.97]} material={mat.hair}>
                <sphereGeometry args={[0.1025, 32, 14, Math.PI, Math.PI, 1.0, 0.95]} />
              </mesh>
              {/* soft volume on top, blended into the cap, with a slight side-swept fringe */}
              <mesh position={[0, 0.19, 0.018]} rotation={[-0.2, 0, 0]} scale={[1.14, 0.6, 1.1]} material={mat.hair}>
                <sphereGeometry args={[0.07, 32, 20]} />
              </mesh>
              <mesh position={[-0.018, 0.186, 0.058]} rotation={[-0.35, 0, 0.18]} scale={[1.35, 0.5, 0.85]} material={mat.hair}>
                <sphereGeometry args={[0.046, 24, 14]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { BoxGeometry, BufferGeometry, DoubleSide, EdgesGeometry, Float32BufferAttribute, QuadraticBezierCurve3, Vector3 } from 'three'
import { PALETTE } from '../../three/scene'
import { createGlyphTexture } from '../../three/textures'

/*
 * Low-opacity developer motifs floating slowly around the character:
 * React atom, braces, database, Laravel-like cubes, API graph, git branch, </>.
 * Listed in priority order — lower quality tiers keep only the first few.
 */

const line = (points) => new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points.flat(), 3))

function ReactAtom() {
  return (
    <group scale={0.1}>
      {[0, Math.PI / 3, -Math.PI / 3].map((r) => (
        <mesh key={r} rotation={[Math.PI / 2, r, 0]} scale={[1, 0.38, 1]}>
          <torusGeometry args={[1, 0.035, 8, 64]} />
          <meshBasicMaterial color={PALETTE.react} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshBasicMaterial color={PALETTE.react} transparent opacity={0.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Glyph({ text, color, height = 0.11 }) {
  const glyph = useMemo(() => createGlyphTexture(text, color), [text, color])
  useEffect(() => () => glyph.texture.dispose(), [glyph])
  return (
    <mesh>
      <planeGeometry args={[height * glyph.aspect, height]} />
      <meshBasicMaterial map={glyph.texture} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Database() {
  return (
    <group scale={0.075}>
      <mesh>
        <cylinderGeometry args={[0.7, 0.7, 1.5, 32, 1, true]} />
        <meshBasicMaterial color={PALETTE.accentBlue} transparent opacity={0.08} depthWrite={false} side={DoubleSide} toneMapped={false} />
      </mesh>
      {[-0.75, -0.25, 0.25, 0.75].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.03, 6, 48]} />
          <meshBasicMaterial color={PALETTE.accentBlue} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function LaravelCubes() {
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), [])
  useEffect(() => () => edges.dispose(), [edges])
  return (
    <group scale={0.065} rotation={[0.5, 0.7, 0]}>
      {[[0, 0, 0], [0.55, 0.55, -0.55]].map((p, i) => (
        <lineSegments key={i} geometry={edges} position={p}>
          <lineBasicMaterial color={PALETTE.laravel} transparent opacity={i ? 0.3 : 0.5} toneMapped={false} />
        </lineSegments>
      ))}
    </group>
  )
}

const API_NODES = [[0, 0, 0], [0.9, 0.5, 0], [0.9, -0.5, 0], [-0.8, 0.6, 0], [-0.9, -0.4, 0]]

function ApiGraph() {
  const links = useMemo(() => line(API_NODES.slice(1).flatMap((n) => [API_NODES[0], n])), [])
  useEffect(() => () => links.dispose(), [links])
  return (
    <group scale={0.07}>
      <lineSegments geometry={links}>
        <lineBasicMaterial color={PALETTE.accentPurple} transparent opacity={0.35} toneMapped={false} />
      </lineSegments>
      {API_NODES.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i ? 0.14 : 0.22, 12, 10]} />
          <meshBasicMaterial color={PALETTE.accentPurple} transparent opacity={i ? 0.45 : 0.65} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function GitBranch() {
  const geometry = useMemo(() => {
    const branch = new QuadraticBezierCurve3(new Vector3(0, -0.4, 0), new Vector3(0.7, -0.1, 0), new Vector3(0.7, 0.6, 0)).getPoints(16)
    const segments = [[[0, -1, 0], [0, 1, 0]], ...branch.slice(1).map((p, i) => [branch[i].toArray(), p.toArray()])]
    return line(segments.flat())
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <group scale={0.075}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={PALETTE.accentBlue} transparent opacity={0.4} toneMapped={false} />
      </lineSegments>
      {[[0, -1, 0], [0, 0, 0], [0, 1, 0], [0.7, 0.6, 0]].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshBasicMaterial color={PALETTE.accentBlue} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// [element, position (x is scaled to the canvas aspect), float speed]
const ITEMS = [
  [<ReactAtom key="react" />, [-0.6, 1.8, -0.7], 1.1],
  [<Glyph key="braces" text="{ }" color={PALETTE.accentPurple} />, [0.6, 1.88, -0.6], 1.3],
  [<Database key="db" />, [0.64, 1.02, -0.5], 0.9],
  [<LaravelCubes key="laravel" />, [-0.64, 1.12, -0.7], 1.0],
  [<ApiGraph key="api" />, [0.5, 0.78, -1.0], 1.2],
  [<GitBranch key="git" />, [-0.5, 2.02, -1.2], 0.8],
  [<Glyph key="tag" text="</>" color={PALETTE.accentBlue} height={0.09} />, [0.48, 1.5, -1.3], 1.4],
]

export function FloatingTech({ count, motionEnabled }) {
  const { size } = useThree()
  // Pull motifs inward on narrow (portrait) canvases so they stay in frame.
  const spread = Math.min(1.15, Math.max(0.72, size.width / size.height / 0.95))

  return ITEMS.slice(0, count).map(([element, [x, y, z], speed], i) => {
    const position = [x * spread, y, z]
    return motionEnabled ? (
      <Float key={i} position={position} speed={speed} rotationIntensity={0.35} floatIntensity={0.35} floatingRange={[-0.03, 0.03]}>
        {element}
      </Float>
    ) : (
      <group key={i} position={position}>
        {element}
      </group>
    )
  })
}

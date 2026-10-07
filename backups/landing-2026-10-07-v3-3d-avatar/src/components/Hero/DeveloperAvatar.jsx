import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import { blink, damp, followTargets, idle, scrollPose } from '../../three/animations'
import { FOLLOW, SCROLL } from '../../three/camera'
import { AVATAR_HEIGHT, AVATAR_MODEL_URL, DRACO_DECODER_PATH } from '../../three/scene'
import { ProceduralAvatar } from './ProceduralAvatar'

const AXES = ['x', 'y', 'z']
const REST = { x: 0, y: 0 }

// Common bone names (Mixamo, Avaturn, VRM-style exports).
const BONES = {
  chest: /(upper_?chest|spine_?2|chest)$/i,
  neck: /neck$/i,
  head: /head$/i,
}
// ARKit-style blink morph targets, or a single "eyesClosed"/"blink" shape.
const BLINK_MORPHS = /^(eyeblink(left|right)|eyes_?closed|blink)$/i

function findBone(root, pattern) {
  let hit = null
  root.traverse((o) => {
    if (!hit && (o.isBone || o.type === 'Object3D') && pattern.test(o.name.replace(/^mixamorig:?/i, ''))) hit = o
  })
  return hit
}

/** Production model path: any rigged .glb/.gltf, normalised to AVATAR_HEIGHT with feet at y = 0. */
function GlbAvatar({ url, rigRef }) {
  const { scene, animations } = useGLTF(url, DRACO_DECODER_PATH)
  const group = useRef(null)
  const { actions, names } = useAnimations(animations, group)

  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const scale = AVATAR_HEIGHT / (size.y || 1)
    return { scale, position: [-center.x * scale, -box.min.y * scale, -center.z * scale] }
  }, [scene])

  useEffect(() => {
    const blinkTargets = []
    scene.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      Object.entries(o.morphTargetDictionary ?? {}).forEach(([name, index]) => {
        if (BLINK_MORPHS.test(name)) blinkTargets.push([o, index])
      })
    })

    const idleClip = names.find((n) => /idle|breath/i.test(n)) ?? names[0]
    const action = idleClip ? actions[idleClip] : null
    action?.reset().fadeIn(0.5).play()

    const rig = { chest: findBone(scene, BONES.chest), neck: findBone(scene, BONES.neck), head: findBone(scene, BONES.head) }
    const joints = [rig.chest, rig.neck, rig.head].filter(Boolean)
    // Joints the idle clip drives get offsets added after the mixer; the rest use their rest pose as base.
    const tracked = new Set((action?.getClip().tracks ?? []).map((track) => track.name.split('.')[0]))
    rig.animatedNodes = new Set(joints.filter((b) => tracked.has(b.name)))
    rig.base = new Map(joints.map((b) => [b, b.rotation.clone()]))
    rig.setBlink = (amount) => blinkTargets.forEach(([mesh, index]) => (mesh.morphTargetInfluences[index] = amount))
    rigRef.current = rig

    return () => {
      action?.fadeOut(0.2)
      rigRef.current = null
    }
  }, [scene, actions, names, rigRef])

  // Free GPU memory when the hero unmounts (e.g. navigating away).
  useEffect(
    () => () => {
      scene.traverse((o) => {
        if (!o.isMesh) return
        o.geometry?.dispose()
        ;[].concat(o.material).forEach((m) => {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose())
          m.dispose()
        })
      })
      useGLTF.clear(url)
    },
    [scene, url],
  )

  return (
    <group ref={group}>
      <primitive object={scene} scale={fit.scale} position={fit.position} />
    </group>
  )
}

/** Adds `offset` to a joint: on top of this frame's clip pose when animated, otherwise on top of the rest pose. */
function offsetJoint(rig, node, offset) {
  if (!node) return
  const base = rig.animatedNodes?.has(node) ? node.rotation : rig.base?.get(node)
  AXES.forEach((axis) => {
    if (offset[axis] === undefined) return
    node.rotation[axis] = (base ? base[axis] : 0) + offset[axis]
  })
}

/**
 * The hero character. Three.js owns every per-frame change here (pointer follow,
 * idle, blink, scroll depth, entrance spring) — values arrive via refs/MotionValues,
 * so nothing in this tree re-renders while it animates.
 */
export function DeveloperAvatar({ pointerRef, hoveredRef, scrollProgress, entrance, motionEnabled, shadows }) {
  const rigRef = useRef(null)
  const root = useRef(null)
  const follow = useRef({ bodyY: 0, chestY: 0, chestX: 0, headY: 0, headX: 0 })

  useEffect(() => {
    if (!shadows) return
    root.current.traverse((o) => {
      if (o.isMesh && !o.material.transparent) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [shadows])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const s = follow.current
    const target = followTargets(motionEnabled ? pointerRef.current : REST, FOLLOW, motionEnabled && hoveredRef.current)
    Object.keys(target).forEach((k) => (s[k] = motionEnabled ? damp(s[k], target[k], 3.2, dt) : target[k]))

    // Entrance spring (0 → 1) and scroll depth both come from Framer Motion values.
    const e = entrance?.get() ?? 1
    const sc = scrollPose(motionEnabled ? (scrollProgress?.get() ?? 0) : 0, SCROLL)
    const g = root.current
    // Enters from the right and from slightly below (≈40px), springing into place.
    g.position.set((1 - e) * 0.22, -(1 - e) * 0.12 + sc.y, sc.z)
    g.scale.setScalar((0.85 + 0.15 * e) * sc.scale)
    g.rotation.y = s.bodyY + sc.rotY

    const rig = rigRef.current
    if (!rig) return
    const id = motionEnabled ? idle(t) : null

    // Breathing: the procedural torso can scale; a skinned chest bone only tilts (scaling it would scale the arms and head).
    offsetJoint(rig, rig.chest, { x: s.chestX + (id ? id.breath * (rig.procedural ? 0.004 : 0.006) : 0), y: s.chestY, z: id ? id.sway : 0 })
    if (rig.procedural && id) rig.chest.scale.set(...id.chestScale)
    offsetJoint(rig, rig.neck, { x: s.headX * 0.35, y: s.headY * 0.35 })
    offsetJoint(rig, rig.head, {
      x: s.headX * 0.65 + (id ? id.headDrift.x : 0),
      y: s.headY * 0.65 + (id ? id.headDrift.y : 0),
      z: id ? id.headDrift.z : 0,
    })
    rig.setBlink?.(id ? blink(t) : 0)
  })

  return (
    <group
      ref={root}
      onPointerOver={(event) => {
        event.stopPropagation()
        hoveredRef.current = true
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        hoveredRef.current = false
      }}
    >
      {/* GLB loading suspends up to AvatarScene, which only reports "ready" once it has resolved. */}
      {AVATAR_MODEL_URL ? <GlbAvatar url={AVATAR_MODEL_URL} rigRef={rigRef} /> : <ProceduralAvatar rigRef={rigRef} />}
    </group>
  )
}

# Landing section backup v3 — 3D developer avatar (2026-10-07)

Premium 3D avatar hero (React Three Fiber + drei): procedural avatar / optional GLB, loader, floating tech, scroll + pointer motion. Yeh photo-with-badges hero se **pehle** ka version hai.

## Files

| Backup | Asli jagah |
|---|---|
| `src/components/Hero/*` | `src/components/Hero/` |
| `src/three/*` | `src/three/` |
| `src/hooks/useSceneQuality.js` | `src/hooks/` |
| `src/config/hero.js` | `src/config/` |
| `src/assets/avatar-fallback.jpg` | `src/assets/` |
| `public/draco/*` | `public/draco/` |
| `.env.example`, `vite.config.js` | project root |

## Wapas laana

Project root se (PowerShell):

```powershell
Copy-Item -Recurse -Force backups\landing-2026-10-07-v3-3d-avatar\src\* src\
Copy-Item -Recurse -Force backups\landing-2026-10-07-v3-3d-avatar\public\* public\
Copy-Item -Force backups\landing-2026-10-07-v3-3d-avatar\.env.example, backups\landing-2026-10-07-v3-3d-avatar\vite.config.js .
Remove-Item src\components\Hero\HeroPortrait.jsx
```

Is version ko `three`, `@react-three/fiber` aur `@react-three/drei` packages chahiye (package.json mein maujood hain). Phir `npm run dev` restart karein.

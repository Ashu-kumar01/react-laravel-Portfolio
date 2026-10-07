# Landing section backup v2 — 2026-10-07

Pehla 3D character wala landing (procedural character, wave gesture, "Hi" bubble, code panels). Yeh premium 3D avatar hero (`src/components/Hero/`) banane se **pehle** ka version hai. Usse bhi pehle ka (bina character) version `backups/landing-2026-10-07/` mein hai.

## Files

| Backup file | Asli jagah |
|---|---|
| `src/sections/hero/Hero.jsx`, `HeroVisual.jsx`, `HeroFallback.jsx` | `src/sections/hero/` |
| `src/three/HeroScene.jsx`, `Avatar.jsx`, `codeSnippets.js`, `textures.js`, `fonts.js` | `src/three/` |
| `src/hooks/useSceneQuality.js` | `src/hooks/useSceneQuality.js` |
| `src/index.css` | `src/index.css` |

## Yeh version wapas laana

Project root se (PowerShell):

```powershell
Copy-Item -Recurse -Force backups\landing-2026-10-07-v2\src\* src\
```

Phir `src/pages/HomePage.jsx` mein import wapas karein:

```js
import { Hero } from '../sections/hero/Hero'
```

Naya `src/components/Hero/` folder aur `src/three/{scene,camera,lighting,animations}.js` is version ke liye zaroori nahi; chahein to hata dein. Phir `npm run dev` restart karein.

# Landing section backup — 2026-10-07

3D character aur naye motion effects add karne se **pehle** ka original landing (hero) section: "code universe" scene, bina character.

## Files

| Backup file | Asli jagah |
|---|---|
| `src/sections/hero/Hero.jsx`, `HeroVisual.jsx`, `HeroFallback.jsx` | `src/sections/hero/` |
| `src/three/HeroScene.jsx`, `codeSnippets.js`, `textures.js`, `fonts.js` | `src/three/` |
| `src/hooks/useSceneQuality.js` | `src/hooks/useSceneQuality.js` |
| `src/pages/HomePage.jsx` | `src/pages/HomePage.jsx` |

## Purana landing wapas laana

Project root se (PowerShell):

```powershell
Copy-Item -Recurse -Force backups\landing-2026-10-07\src\* src\
```

`HomePage.jsx` bhi restore hota hai, isliye import apne aap `../sections/hero/Hero` par wapas aa jata hai. Naye hero ki files (`src/components/Hero/`, `src/three/{scene,camera,lighting,animations}.js`) is version ke liye zaroori nahi; chahein to hata dein. Phir `npm run dev` restart karein.

Yeh folder app ka hissa nahi hai: Vite ise build nahi karta aur eslint ise ignore karta hai.

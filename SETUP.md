# Local Setup — kya kya set kiya gaya hai

Yeh file batati hai ki is project ko local Windows (XAMPP) machine par chalane ke liye **exactly kya-kya setup kiya gaya**, kaunsi files/folders bane, aur dono `public` folders ke andar kya hai. Poori general guide aur cPanel deployment ke liye [README.md](README.md) dekhein. API kaise chalaya gaya aur "Connection lost" error kaise theek hua, woh [API_SETUP.md](API_SETUP.md) mein hai.

> **Yeh file `public/` ya `backend/public/` mein na rakhein.** Dono folders ka content web par seedha serve hota hai, aur is file mein local admin credentials jaisi details hain.

---

## 1. Machine par kya chahiye tha (verified)

| Tool | Version jo mila | Location |
|---|---|---|
| PHP | 8.2.12 (XAMPP) | `C:\xampp\php\php.exe` |
| Composer | 2.10.0 | `C:\composer\composer.bat` |
| Node.js | 24.17.0 | `C:\Program Files\nodejs` |
| MySQL server | MariaDB 10.4.32 (XAMPP) | `C:\xampp\mysql\bin` |
| Git | installed | `C:\Program Files\Git` |

Zaroori PHP extensions enabled hain: `pdo_mysql`, `mbstring`, `openssl`, `curl`, `fileinfo`, `zip`.

> `mysql` command PATH mein nahi hai. Use karne ke liye poora path dein: `C:\xampp\mysql\bin\mysql.exe -u root`. XAMPP Control Panel se **MySQL start** hona chahiye.

---

## 2. Setup steps jo chalaye gaye

Sab commands project root (`react-laravel-Portfolio`) se, PowerShell mein.

### Step 1 — Environment files

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
```

| File | Kis liye | Kya value hai |
|---|---|---|
| `.env` (root) | React/Vite frontend | `VITE_API_BASE_URL=http://localhost:8000/api/v1`, `VITE_SITE_URL=http://localhost:5173` |
| `backend/.env` | Laravel API | `DB_DATABASE=ak_portfolio`, `DB_USERNAME=root`, `DB_PASSWORD=` (XAMPP default — khaali), `ADMIN_PASSWORD=` (khaali) |

Dono files `.gitignore` mein hain — commit nahi hongi.

### Step 2 — Database

```powershell
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE ak_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 3 — Laravel backend

```powershell
cd backend
composer install
php artisan key:generate      # backend/.env mein APP_KEY set hoti hai
php artisan migrate --seed    # 11 migrations + 6 seeders
php artisan storage:link      # backend/public/storage link banta hai
cd ..
```

**Migrations se bani tables:** `users`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `personal_access_tokens`, `projects`, `technologies`, `experiences`, `services`, `contact_messages`, `resumes`, `settings`, `migrations`.

**Seeders jo chale:** `AdminUserSeeder`, `SettingSeeder`, `TechnologySeeder`, `ProjectSeeder`, `ExperienceSeeder`, `ServiceSeeder`.

> Repo mein `ak_portfolio.sql` (phpMyAdmin dump) bhi hai. Woh isi seed data ka export hai, isliye use import karne ki zaroorat nahi — `migrate --seed` wahi data bana deta hai. Dono ek saath na chalayein, warna duplicate/conflict hoga.

### Step 4 — React frontend

```powershell
npm ci        # package-lock.json ke mutabik 312 packages
```

---

## 3. Dono `public` folders ke andar kya hai

Project mein **do alag** `public` folders hain aur dono ka kaam alag hai.

### `public/` (root — React/Vite)

| File | Kaam |
|---|---|
| `favicon.svg` | Browser tab icon ("AK" logo) |

- Vite is folder ki har file ko **bina badle** `dist/` ke root mein copy karta hai. Production mein `dist/` ka content `public_html` mein jaata hai, matlab yahan rakhi har file `https://example.com/<file>` par public hogi.
- `robots.txt` aur `sitemap.xml` yahan **nahi** rakhe jaate. Woh build ke waqt `scripts/vite-plugin-seo-files.js` se `dist/` mein generate hote hain (`VITE_SITE_URL` aur API se project URLs lekar).
- Yahan sirf static assets rakhein jo sabko dikhne chahiye (icons, images, `og-image` waghaira). Koi secret/config/document nahi.

### `backend/public/` (Laravel — web document root)

| File / Folder | Kaam | Git mein? |
|---|---|---|
| `index.php` | Laravel ka entry point — har API request isi se guzarti hai | Haan |
| `.htaccess` | Apache rewrite rules — URLs ko `index.php` par bhejta hai | Haan |
| `robots.txt` | API domain ke liye robots file | Haan |
| `favicon.ico` | Default Laravel icon | Haan |
| `storage` | **Setup mein bana.** `php artisan storage:link` ka junction link → `backend/storage/app/public` | Nahi (har machine par dobara banana hota hai) |

- `storage` link ki wajah se uploaded project images/icons `http://localhost:8000/storage/...` par milte hain. Images 404 dein to `php artisan storage:link` dobara chalayein.
- Resume file **private** storage (`backend/storage/app/private`) mein rehti hai, public link se nahi — sirf API (`GET /api/v1/resume`) ke zariye download hoti hai.
- Production mein sirf yeh folder web root hona chahiye; Laravel ki baaki files (`.env`, `app/`, `vendor/` …) is folder ke **bahar** rehni chahiye.

---

## 4. Setup ke dauraan bane / badle files

| Path | Kaise bana | Git mein? |
|---|---|---|
| `.env` | Step 1 | Nahi |
| `backend/.env` (+ `APP_KEY`) | Step 1, 3 | Nahi |
| `backend/vendor/` | `composer install` | Nahi |
| `node_modules/` | `npm ci` | Nahi |
| `backend/public/storage` | `storage:link` | Nahi |
| `dist/` | `npm run build` | Nahi |
| `backend/tests/Unit/.gitkeep` | **Naya add kiya** — neeche dekhein | Haan |

**`tests/Unit/.gitkeep` kyun?** `backend/phpunit.xml` mein `Unit` test suite configured hai, lekin Git khaali folder track nahi karta, isliye fresh clone par `tests/Unit` folder hi nahi tha aur `php artisan test` error deta tha: `Test directory "tests/Unit" not found`. Khaali `.gitkeep` se folder repo mein rahega.

---

## 5. Verification — kya check kiya gaya

| Check | Result |
|---|---|
| `php artisan test` | ✅ 48 tests passed (385 assertions) |
| `GET http://localhost:8000/api/v1/health` | ✅ `"status":"operational","database":"ok"` |
| `GET /api/v1/projects` | ✅ seeded projects aa rahe hain |
| `POST /api/v1/admin/login` | ✅ "Logged in successfully" |
| `npm run build` | ✅ `dist/` bana — `index.html`, `assets/`, `favicon.svg`, `robots.txt`, `sitemap.xml` (project URLs ke saath) |
| `http://localhost:5173/` aur `/admin/login` | ✅ HTTP 200 |
| `npx vitest run` | ⚠️ "No test files found" — frontend mein abhi koi `*.test.jsx` file nahi hai, aur `vite.config.js` jo `src/test/setup.js` maangta hai woh bhi nahi hai. Setup error nahi; tests likhne par yeh file banani hogi. |

---

## 6. Roz project kaise chalayein

1. XAMPP Control Panel se **MySQL** start karein.
2. **Terminal 1** — API:

   ```powershell
   cd backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

3. **Terminal 2** — frontend (project root se):

   ```powershell
   npm run dev
   ```

| Kya | URL |
|---|---|
| Portfolio | <http://localhost:5173> |
| Admin panel | <http://localhost:5173/admin/login> |
| API health | <http://localhost:8000/api/v1/health> |

### Local admin login

`backend/.env` mein `ADMIN_PASSWORD` khaali hai, isliye seeder ne `backend/config/portfolio.php` ka **development fallback password** use kiya:

- **Username:** `Admin` (ya email `admin@example.com`)
- **Password:** `Ashwani@#1q2`

> Yeh sirf local ke liye hai. Production mein `ADMIN_PASSWORD` zaroor set karein — wahan khaali hone par seeder fail ho jaata hai. Login API field ka naam `login` hai (username ya email dono chalte hain), `username` nahi.

---

## 7. Kaam ki commands

| Kaam | Command |
|---|---|
| Database poora reset + dobara seed | `cd backend; php artisan migrate:fresh --seed` |
| `.env` badalne ke baad config refresh | `cd backend; php artisan config:clear` |
| Backend tests | `cd backend; php artisan test` |
| Frontend production build | `npm run build` |
| Build ko locally dekhna | `npm run preview` → <http://localhost:4173> |
| Lint | `npm run lint` |

Root `.env` badalne ke baad `npm run dev` restart karein — Vite env values sirf start par padhta hai.

---

## 8. Problem jo setup ke baad aayi — "500 Something went wrong"

**Lakshan:** `http://localhost:5173` kholne par page dikhata tha: *"500 — Something went wrong. A new version of the site may have been deployed."* Vite terminal mein: `Failed to fetch dynamically imported module: .../ContactForm.jsx`.

**Wajah:** `ContactForm`, admin pages aur 3D hero lazy-load hote hain. Unki packages (`react-hook-form`, `@hookform/resolvers/zod`, `zod`, `three`, `@react-three/fiber`) Vite ke shuruaati dependency scan mein nahi aayin. Baad mein Vite ne unhein dobara bundle kiya, jisse browser ke paas pade purane module links **504 Outdated Optimize Dep** dene lage.

**Fix:** `vite.config.js` mein `optimizeDeps.include` mein yeh packages add kiye, taaki dev server start hote hi bundle ho jaayein.

Agar phir kabhi aisa ho:

```powershell
# dev server band karein (Ctrl+C), phir:
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

Browser mein **Ctrl+Shift+R** (hard reload) karein. Kisi naye lazy page mein nayi npm package import karein to use bhi `optimizeDeps.include` mein jod dein.

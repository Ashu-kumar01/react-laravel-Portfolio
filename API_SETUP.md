# API Setup — Laravel API ko kaam mein kaise laaya

Yeh doc batata hai ki Laravel API local machine par kaise chalaya gaya, React frontend usse kaise judta hai, setup ke baad API kyun kaam nahi kar raha tha ("Connection lost"), aur use kaise theek kiya gaya. General setup ke liye [SETUP.md](SETUP.md) dekhein.

---

## 1. Frontend API se kaise judta hai

```text
Browser (http://localhost:5173)                   
Laravel API (http://localhost:8000)
  React app ──── axios ── VITE_API_BASE_URL ───────▶  /api/v1/...  ──▶ MySQL (ak_portfolio)
                 (src/api/client.js)                   config/cors.php decide karta hai
                                                       ki kaunsa origin allowed hai
```

- Frontend aur API **alag origin** par chalte hain (port `5173` aur `8000`), isliye browser har request par **CORS** check karta hai. Agar API jawab mein `Access-Control-Allow-Origin: http://localhost:5173` header nahi bhejta, to browser jawab ko block kar deta hai, chahe server ne 200 hi kyun na diya ho.
- Frontend ka axios client (`src/api/client.js`) har request ke liye 20 second ka timeout rakhta hai. Network/CORS fail hone par UI yeh message dikhata hai: **"Connection lost. Check your internet connection and try again."** (`src/api/errors.js`). Isliye yeh message aksar internet ki nahi, balki API/CORS ki problem hota hai.
- Admin panel login ke baad **Bearer token** (Laravel Sanctum) bhejta hai, cookies nahi. Isliye CORS mein `supports_credentials` `false` hai.

### Kaunsi setting kahan

| Setting | File | Local value | Kaam |
|---|---|---|---|
| `VITE_API_BASE_URL` | root `.env` | `http://localhost:8000/api/v1` | Frontend API ko kahan call kare |
| `APP_URL` | `backend/.env` | `http://localhost:8000` | API ka apna URL (upload URLs waghaira) |
| `FRONTEND_URL` | `backend/.env` | `http://localhost:5173` | CORS mein allowed origin (default) |
| `CORS_ALLOWED_ORIGINS` | `backend/.env` | khaali | Ek se zyada origins chahiye to comma-separated list; khaali ho to `FRONTEND_URL` use hota hai |
| `DB_*` | `backend/.env` | `127.0.0.1`, `ak_portfolio`, `root`, password khaali | MySQL connection |
| `SANCTUM_TOKEN_EXPIRATION` | `backend/.env` | `480` | Admin token kitne minute chale |

---

## 2. API chalane ke steps (jo kiye gaye)

1. XAMPP Control Panel se **MySQL** start kiya (port `3306`).
2. `backend/.env` banaya, `php artisan key:generate`, `php artisan migrate --seed`, `php artisan storage:link` chalaye. Detail [SETUP.md](SETUP.md) section 2 mein hai.
3. API server start kiya:

   ```powershell
   cd backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

4. Health check kiya:

   ```powershell
   curl.exe http://localhost:8000/api/v1/health
   ```

   Sahi jawab:

   ```json
   {"success":true,"message":"API is running","data":{"status":"operational","database":"ok","version":"v1"}}
   ```

   `"database":"ok"` ka matlab hai ki MySQL connection bhi theek hai.

---

## 3. Problem — "Connection lost" (API kaam nahi kar raha tha)

### Lakshan

- Admin login (`/admin/login`) par submit karne par page **"Connection lost. Check your internet connection and try again."** dikhata tha.
- Phir bhi `curl` se API bilkul theek jawab de raha tha, aur `php artisan serve` ke log mein requests aa rahi thi. Isliye pehli nazar mein lagta tha ki API chal raha hai.

### Jaanch kaise ki

1. **Server chal raha hai?** Port `8000` par process listen kar raha tha, aur `/health` ne `200` diya. Server theek tha.
2. **Browser mein reproduce kiya** (headless Chromium / Playwright): login request turant `net::ERR_FAILED` ke saath fail hui. Yeh timeout nahi tha; browser ne khud request block ki thi, jo CORS ka lakshan hai.
3. **CORS preflight check kiya:**

   ```powershell
   curl.exe -i -X OPTIONS http://127.0.0.1:8000/api/v1/admin/login `
     -H "Origin: http://localhost:5173" `
     -H "Access-Control-Request-Method: POST" `
     -H "Access-Control-Request-Headers: content-type,x-requested-with"
   ```

   Jawab `204` tha, lekin usmein **koi `Access-Control-Allow-*` header nahi** tha. Normal `GET /health` par bhi nahi tha.
4. **Laravel ki asli CORS config dekhi:**

   ```powershell
   cd backend
   php artisan tinker --execute="dump(config('cors.allowed_origins'));"
   ```

   Nateeja: `[]`, yaani **ek bhi origin allowed nahi tha**.

### Asli wajah

`backend/config/cors.php` mein yeh line thi:

```php
env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:5173'))
```

Aur `backend/.env.example` (jisse `.env` copy hua) mein:

```dotenv
CORS_ALLOWED_ORIGINS=
```

Laravel ka `env()` default value **sirf tab** deta hai jab variable bilkul maujood na ho. Variable khaali likha ho (`CORS_ALLOWED_ORIGINS=`) to `env()` khaali string `""` deta hai, default nahi. Isliye `FRONTEND_URL` kabhi use nahi hua, allowed origins ki list khaali bani, aur browser ne API ka har jawab block kar diya.

### Fix

`backend/config/cors.php` mein `env()` ke default ki jagah `?:` use kiya, taaki khaali value par bhi `FRONTEND_URL` lage:

```php
// `?:` (not env()'s default) so an empty `CORS_ALLOWED_ORIGINS=` line still falls back to FRONTEND_URL.
$origins = array_filter(array_map('trim', explode(',', (string) (env('CORS_ALLOWED_ORIGINS') ?: env('FRONTEND_URL', 'http://localhost:5173')))));
```

Phir config cache saaf ki:

```powershell
cd backend
php artisan config:clear
```

`php artisan serve` har request par config dobara padhta hai, isliye server restart ki zaroorat nahi padi. Production mein `config:cache` use hota hai, wahan `.env`/config badalne ke baad `php artisan config:clear` aur phir `php artisan config:cache` zaroor chalayein.

> Yeh fix production ke liye bhi zaroori tha: cPanel par `CORS_ALLOWED_ORIGINS` khaali chhodne par live site par bhi yahi problem aati.

### Fix ke baad verification

| Check | Result |
|---|---|
| `config('cors.allowed_origins')` | `["http://localhost:5173"]` |
| Preflight `OPTIONS /api/v1/admin/login` | `Access-Control-Allow-Origin: http://localhost:5173` aur allowed methods/headers aa rahe hain |
| `php artisan test` | 48 passed (385 assertions) |
| Browser: home page | Seeded projects (jaise "OpenCompas Educational ERP") dikh rahe hain, "Connection lost" nahi |
| Browser: admin login | `Admin` / `Ashwani@#1q2` se login hokar 1.6 second mein `/admin/dashboard` khula |
| Failed API requests | Koi nahi |

---

## 4. Agar "Connection lost" phir dikhe — checklist

Is order mein check karein:

1. **API chal raha hai?**

   ```powershell
   curl.exe http://localhost:8000/api/v1/health
   ```

   Jawab na aaye to `cd backend; php artisan serve --host=127.0.0.1 --port=8000` chalayein. `"database"` `ok` na ho to XAMPP mein MySQL start karein.

2. **CORS header aa raha hai?**

   ```powershell
   curl.exe -i http://localhost:8000/api/v1/health -H "Origin: http://localhost:5173"
   ```

   Jawab mein `Access-Control-Allow-Origin: http://localhost:5173` hona chahiye. Na ho to:
   - `backend/.env` mein `FRONTEND_URL` exactly wahi ho jo browser ke address bar mein hai (`http://localhost:5173`, aakhir mein `/` nahi). Agar aap `http://127.0.0.1:5173` khol rahe hain, to woh alag origin hai; use bhi `CORS_ALLOWED_ORIGINS` mein jodein.
   - `cd backend; php artisan config:clear` chalayein.

3. **Frontend sahi URL call kar raha hai?** Root `.env` mein `VITE_API_BASE_URL=http://localhost:8000/api/v1` ho. Badalne ke baad `npm run dev` restart karein.
4. **Browser DevTools → Network** mein fail hui request kholein. Console mein `blocked by CORS policy` likha ho to step 2 dekhein. `(failed)` ya timeout ho to step 1 dekhein.

---

## 5. Local server ki ek seema (jaankari ke liye)

`php artisan serve` (PHP ka built-in server) Windows par **ek waqt mein ek hi request** handle karta hai; `.env` ka `PHP_CLI_SERVER_WORKERS=4` Windows par kaam nahi karta. Page khulte hi frontend kai API requests ek saath bhejta hai, isliye kabhi-kabhi requests thodi der line mein ruk sakti hain. Local development ke liye yeh theek hai. Production (cPanel/Apache) par yeh seema nahi hoti.

Ek aur chhoti baat: server `127.0.0.1` par bind hai, aur browser `localhost` ko pehle IPv6 (`::1`) par try karta hai. Isliye har request mein ~0.2 second ka extra delay ho sakta hai. Yeh bhi sirf local mein hota hai.

---

## 6. API endpoints

Base URL: `http://localhost:8000/api/v1`. Saare jawab is format mein aate hain: `{ "success": ..., "message": ..., "data": ..., "meta": ... }`.

### Public (login ki zaroorat nahi)

| Method | Path | Kaam |
|---|---|---|
| GET | `/health` | API + database status |
| GET | `/profile` | Profile/settings data |
| GET | `/projects` | Published projects |
| GET | `/projects/{slug}` | Ek project ki detail |
| GET | `/technologies` | Skills/technologies |
| GET | `/experience` | Work experience |
| GET | `/services` | Services |
| GET | `/resume` | Resume info |
| GET | `/resume/download` | Resume file download (private storage se) |
| POST | `/contact` | Contact form message save karna |

### Admin (header `Authorization: Bearer <token>` zaroori)

| Method | Path | Kaam |
|---|---|---|
| POST | `/admin/login` | Body: `{"login": "Admin", "password": "..."}`. `login` mein username ya email dono chalte hain. Token deta hai. |
| POST | `/admin/logout` | Current token delete |
| GET | `/admin/me` | Logged-in user |
| GET | `/admin/dashboard` | Dashboard stats |
| GET/POST, GET/PUT/PATCH/DELETE `{id}` | `/admin/projects`, `/admin/technologies`, `/admin/experiences`, `/admin/services` | CRUD |
| GET, GET/DELETE `{id}`, PATCH `{id}/status` | `/admin/messages` | Contact messages |
| GET/POST/DELETE, GET `download` | `/admin/resume` | Resume upload/manage |
| GET/PUT | `/admin/settings` | Site settings |
| PUT | `/admin/account`, `/admin/account/password` | Admin profile aur password badalna |

Poori list: `cd backend; php artisan route:list --path=api`.

### Terminal se admin API test karna

```powershell
$body = '{"login":"Admin","password":"Ashwani@#1q2"}'
$res  = Invoke-RestMethod http://localhost:8000/api/v1/admin/login -Method Post -Body $body -ContentType 'application/json' -Headers @{Accept='application/json'}
$token = $res.data.token
Invoke-RestMethod http://localhost:8000/api/v1/admin/me -Headers @{Accept='application/json'; Authorization="Bearer $token"}
```

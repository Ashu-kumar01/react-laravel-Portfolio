# Ashwani Kumar Kushwaha — Portfolio

Yeh portfolio do alag applications se bana hai:

- **Frontend:** React 19 + Vite — portfolio website aur admin panel.
- **Backend:** Laravel 12 REST API — portfolio content, contact messages, admin authentication aur uploads.
- **Database:** MySQL ya MariaDB.

Frontend API se data leta hai; isliye local development mein Laravel API aur React frontend dono chalne chahiye.

## Zaroori software

Naye computer par pehle yeh install karein:

1. **Git** — repository clone karne ke liye.
2. **PHP 8.2 ya usse naya version.** PHP mein `ctype`, `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenizer`, `xml` aur `dom` extensions enabled hon. Windows par PHP install karte waqt `php.ini` mein `extension=pdo_mysql` enabled hona chahiye.
3. **Composer 2** — Laravel/PHP dependencies install karne ke liye.
4. **Node.js 22 LTS (22.22.2 ya newer) aur npm** — React dependencies aur Vite ke liye. npm, Node.js installer ke saath aata hai.
5. **MySQL 8+ ya compatible MariaDB** — database ke liye. MySQL Workbench optional hai; database command line se bhi bana sakte hain.

Install check:

```bash
git --version
php -v
composer --version
node -v
npm -v
```

## Naye computer par setup

### 1. Project clone karein

Repository URL ko apne GitHub repository URL se replace karein:

```bash
git clone <repository-url>
cd react-laravel-Portfolio
```

### 2. MySQL database banayein

MySQL mein login karke yeh database banayein. MySQL Workbench mein bhi isi SQL ko chala sakte hain:

```sql
CREATE DATABASE ak_portfolio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Database user/password yaad rakhein; backend environment file mein yahi values deni hongi.

### 3. Environment files banayein

Project root folder mein yeh commands chalayein.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
```

**macOS/Linux:**

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Do alag files configure karni hain:

- **`backend/.env`** — Laravel API aur database configuration.
- **Root `.env`** — React frontend configuration.

`backend/.env` ko editor mein khol kar kam se kam yeh values apne setup ke mutabik set karein:

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ak_portfolio
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

ADMIN_NAME="Ashwani Kumar Kushwaha"
ADMIN_USERNAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=apna_local_admin_password
```

`DB_USERNAME` aur `DB_PASSWORD` apne MySQL credentials se badlein. Agar MySQL user ka password nahi hai to `DB_PASSWORD=` khaali chhod sakte hain. Apna admin password set karne par wahi admin account ke liye use hoga.

Root `.env` ke local development URLs aam taur par yeh hi rahenge:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SITE_URL=http://localhost:5173
```

### 4. Laravel backend install aur database initialize karein

Project root se:

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Isse PHP packages install honge, Laravel application key banegi, database tables aur initial portfolio/admin data seed hoga, aur public uploads ke liye storage link banega.

> `ADMIN_PASSWORD` ko pehle set karna behtar hai. Local development mein khaali chhodne par project ka development fallback password use hota hai; production mein password khaali hone par seeder fail hota hai. Development fallback ko production mein kabhi use na karein.

Project root par lautne ke liye:

```bash
cd ..
```

### 5. React frontend dependencies install karein

Project root (`react-laravel-Portfolio`) mein:

```bash
npm ci
```

`npm ci` lock file ke mutabik exact frontend dependencies install karta hai. Agar `package-lock.json` available na ho tab `npm install` use karein.

## Project chalana

Dono servers ko **alag-alag terminals** mein chalayen. Pehle backend start karein.

**Terminal 1 — Laravel API:**

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 — React frontend** (project root se):

```bash
npm run dev
```

Browser mein kholein:

- Portfolio: <http://localhost:5173>
- Admin login: <http://localhost:5173/admin/login>
- API health check: <http://localhost:8000/api/v1/health>

Admin login ke liye `backend/.env` mein set kiya hua `ADMIN_USERNAME` aur `ADMIN_PASSWORD` use karein. Defaults ke mutabik username `Admin` hai.

## Build aur tests

Frontend ka production build banane ke liye project root se:

```bash
npm run build
```

Build output `dist/` folder mein aata hai. Laravel tests chalane ke liye:

```bash
cd backend
php artisan test
```

Frontend tests (Vitest) chalane ke liye project root se:

```bash
npx vitest run
```








## cPanel par website live karna — step-by-step
=========================================================================

Is project ko cPanel par do hostnames par deploy karna recommended hai:

- **React website:** `https://example.com` (ya `https://www.example.com`), document root `public_html`.
- **Laravel API:** `https://api.example.com`, document root Laravel project ke `public` folder par.

`example.com` ko apne domain se replace karein. React build static files hain—production website ko chalane ke liye Node.js server ki zaroorat nahi. Laravel API ko PHP aur MySQL chahiye.

> Hosting kharidne se pehle provider se confirm karein ki plan PHP 8.2+, MySQL, required PHP extensions, SSH/cPanel Terminal, Composer, subdomain, SSL aur Laravel ke `public/` folder ko document root banane deta hai. Terminal/Composer na ho to backend deploy karna mushkil ho sakta hai; host se pehle support confirm karein.

### 1. Domain, DNS aur SSL taiyar karein

1. Domain ko hosting ke nameservers par point karein, ya hosting ke diye hue DNS records add karein. DNS update hone mein kuch waqt lag sakta hai.
2. cPanel → **Domains** mein main domain aur `api` subdomain banayein. API subdomain ka naam, misaal ke liye, `api.example.com` hoga.
3. Main domain ka document root `public_html` rakhein.
4. API subdomain ka document root Laravel ke `public` folder par set karein, jaise:

   ```text
   /home/CPANEL_USERNAME/portfolio-api/public
   ```

   Neeche wale steps mein Laravel ke baaki files `/home/CPANEL_USERNAME/portfolio-api` mein rahenge—`public_html` ke andar nahi. Agar cPanel API subdomain ka document root home directory ke is folder par set nahi karne deta, hosting support se API domain ka document root `portfolio-api/public` par configure karwayein. **Poora Laravel project `public_html` mein upload na karein.**

5. cPanel → **SSL/TLS Status** (ya host ka SSL/AutoSSL section) se dono domains ke liye SSL activate karein. Aage ke steps mein `https://` URLs tabhi use karein jab certificate active ho.

### 2. cPanel mein database aur user banayein

1. cPanel → **MySQL Database Wizard** kholein.
2. `ak_portfolio` naam ka database banayein. cPanel aksar database ke aage account prefix lagata hai; screen par dikh raha **poora database naam** note karein.
3. Alag database user aur strong password banayein; username ka poora prefixed naam note karein.
4. User ko isi database par **ALL PRIVILEGES** dein.
5. Yeh exact database name, username aur password backend `.env` mein bharne honge. MySQL host aam taur par `localhost` hota hai—apne provider se verify karein.

### 3. Laravel backend files upload karein

Pehle cPanel → **Terminal/SSH** kholkar yeh directory banayein. Is directory ko `public_html` ke bahar rakhein.

```bash
mkdir -p ~/portfolio-api
```

Backend files upload karne ke do aam tareeqe:

- SSH/Git available ho to repository clone karein aur Laravel files `backend/` directory se `/home/CPANEL_USERNAME/portfolio-api` mein rakhein.
- SSH na ho to apne computer par **sirf `backend/` ke source files** ka ZIP banayein aur cPanel File Manager se `/home/CPANEL_USERNAME/portfolio-api` mein upload karke extract karein. `.env`, `.git`, local `node_modules` ya local secrets ZIP mein na daalein. `composer.json` aur `composer.lock` zaroor shamil karein.

Upload ke baad is directory ke andar `artisan`, `composer.json`, `app/`, `bootstrap/`, `config/`, `database/`, `public/`, `resources/`, `routes/` aur `storage/` hon. Agar File Manager dotfiles chhupata hai, **Show Hidden Files** enable karein. Zaroorat par `backend/.env.example` ko copy karke isi directory mein `.env` banayein.

### 4. PHP version aur extensions set karein

1. cPanel → **MultiPHP Manager** (ya Select PHP Version) mein API domain ke liye PHP **8.2 ya newer** select karein.
2. Yeh extensions enabled hon: `ctype`, `curl`, `dom`, `fileinfo`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenizer`, `xml`.
3. cPanel Terminal mein `php -v` aur `php -m` se CLI PHP bhi check karein. Web PHP aur CLI PHP versions alag ho sakte hain; `composer`/`artisan` commands ko PHP 8.2+ CLI se chalna chahiye. Provider ka versioned PHP command, misaal ke liye `php82`, agar zaroori ho to use karein.

### 5. Production `.env` configure karein

`/home/CPANEL_USERNAME/portfolio-api/.env` banayein/kholen. `CPANEL_USERNAME` aur domain/database placeholders ko apni actual values se replace karein:

```dotenv
APP_NAME="Portfolio API"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.example.com

FRONTEND_URL=https://example.com
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=CPANEL_PREFIX_ak_portfolio
DB_USERNAME=CPANEL_PREFIX_dbuser
DB_PASSWORD="your-strong-database-password"

ADMIN_NAME="Portfolio Admin"
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD="your-unique-strong-admin-password"
```

- `APP_DEBUG=false` live site par zaroor rakhein.
- `APP_KEY` pehli deployment par blank chhodein; agle step mein generate hoga. Agar existing live installation update kar rahe hain to purani `APP_KEY` ko **na badlein**.
- `DB_DATABASE`/`DB_USERNAME` mein cPanel ke dikhaye hue poore prefixed values dein.
- `FRONTEND_URL` frontend ka canonical origin hai; `CORS_ALLOWED_ORIGINS` mein browser se website kholne wale origins comma-separated dein. URL ke aakhir mein slash na lagayein. Agar `www` ko canonical rakhte hain, to `FRONTEND_URL` aur root `.env` ka `VITE_SITE_URL` dono `https://www.example.com` hon.
- Unique admin password set karein; is file ko public folder mein nahi, project root mein rakhein aur kisi ke saath share/commit na karein.
- Baaki Laravel defaults (session/cache/queue `database`, mail `log`) ko chhodne par unki tables project migrations se banti hain. Mail `log` par hone se contact submissions database/admin panel mein aayengi, email notification automatically nahi bheji jaati.

### 6. Composer dependencies, migrations aur seed data

cPanel Terminal mein:

```bash
cd /home/CPANEL_USERNAME/portfolio-api
composer install --no-dev --optimize-autoloader --no-interaction
php artisan key:generate
php artisan config:clear
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache
```

Apne hosting path ke mutabik `CPANEL_USERNAME` badlein. Agar PHP command versioned hai to `php artisan ...` ki jagah us provider ka PHP 8.2+ CLI command use karein.

- `migrate --force` tables banata hai; `db:seed --force` shuruati portfolio data aur admin account banata hai. Yeh initial setup par ek baar karein. Existing live database par bina backup/review ke seed dobara na chalayein.
- `storage:link` public project images/icons ke liye `public/storage` link banata hai. Agar shared hosting symlink command ko rokta hai, host se symlink support enable karwayein ya unki Laravel deployment guidance follow karein—Laravel core files ko public folder mein copy karke expose na karein.
- `config:cache` production config cache karta hai. Baad mein `.env` update karne par `php artisan config:clear` ke baad dobara `php artisan config:cache` chalayein.
- Agar `composer` command nahi milti, cPanel mein Composer feature/Terminal enable karwayein. Local Windows ka `vendor/` folder seedha upload karna preferred tareeqa nahi; provider se Composer chalane ka approved option lein.

### 7. Laravel storage permissions verify karein

Laravel ko `storage/` aur `bootstrap/cache/` mein write access chahiye. cPanel File Manager mein in directories ki ownership/permissions hosting ke PHP setup ke mutabik set karein; aam taur par directories `755` ya `775` hoti hain. **`777` permissions na lagayein.** Upload limits bhi check karein: project image max 4 MB, resume max 5 MB hai; PHP `upload_max_filesize` aur `post_max_size` ko in limits se zyada set karna hoga.

### 8. Laravel API verify karein

Browser mein yeh URL kholein:

```text
https://api.example.com/api/v1/health
```

API ka health response aana chahiye. Agar 500 error aaye to cPanel → **Errors** ya `portfolio-api/storage/logs/laravel.log` check karein. Live par `APP_DEBUG=true` karke error dikhana nahi chahiye; `APP_DEBUG=false` hi rakhein.

### 9. React website ko production ke liye build karein

Apne computer par project root folder mein root `.env` ko **build se pehle** production URLs ke saath set karein:

```dotenv
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_SITE_URL=https://example.com
```

Phir:

```bash
npm ci
npm run build
```

Build `dist/` folder mein aayega. SEO plugin projects ki detail URLs sitemap mein daalne ke liye build waqt public API ko fetch karta hai; isliye API pehle live/reachable ho to behtar hai. Build API unavailable hone par bhi banega, magar `sitemap.xml` mein project-specific URLs nahi honge—API live hone par build dobara karein.

### 10. Frontend `dist/` ko `public_html` mein upload karein

1. cPanel File Manager mein main domain ka `public_html` kholein.
2. `dist/` **ke andar ka content** upload karein—poora `dist` folder nahi. `index.html`, `assets/`, `favicon.svg`, `robots.txt` aur `sitemap.xml` `public_html` ke root mein hone chahiye.
3. React Router ke `/projects`, `/admin/login` jaise direct URLs/refresh chalane ke liye `public_html/.htaccess` file banayein. Agar file maujood hai to existing rules ka backup lekar yeh SPA fallback usmein merge karein:

   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </IfModule>
   ```

   cPanel File Manager mein hidden files dikhana zaroori ho sakta hai. API subdomain ki Laravel `.htaccess` alag hai—use replace/edit karke React rules na daalein.

### 11. Live site ka final test

1. `https://example.com` kholkar homepage dekhein.
2. `https://example.com/projects` aur `https://example.com/admin/login` ko seedha address bar mein kholein, refresh karein; 404 nahi aana chahiye.
3. Browser developer tools → **Network/Console** mein API requests dekhein. Unka host `https://api.example.com` hona chahiye; CORS error nahi aana chahiye.
4. Admin credentials se login karein; ek portfolio page, image, resume download aur contact form test karein.
5. `https://example.com/robots.txt` aur `https://example.com/sitemap.xml` verify karein. Sitemap build ke waqt API unavailable thi to production URLs sahi karke frontend rebuild/re-upload karein.

### 12. Baad mein update kaise deploy karein

1. Live database/files ka backup lein, khaaskar migrations ya uploads badalne se pehle.
2. Naya Laravel backend code upload karein—`.env`, user uploads aur existing `APP_KEY` ko overwrite/delete na karein.
3. Terminal se `composer install --no-dev --optimize-autoloader --no-interaction` chalayein; schema update ho to `php artisan migrate --force` chalayein. Normal update par `db:seed` dobara na chalayein.
4. React code update hone par local production `.env` ke saath `npm run build` karein aur naye `dist/` ka content `public_html` mein upload karke replace karein.
5. `https://example.com` aur API health URL check karein. Deployment fail ho to cPanel File Manager/backup se pichle frontend ya backend files restore karein; database rollback karne se pehle backup aur migration impact samjhein.

## Deployment ke liye zaroori baatein

- Production server par `APP_DEBUG=false` rakhein aur `APP_KEY` ko secure rakhein.
- Production `.env` mein strong, unique `ADMIN_PASSWORD` set karein **seeder chalane se pehle**. `.env` ya secrets ko Git mein commit/share na karein.
- Production database par:

  ```bash
  cd backend
  php artisan migrate --force
  ```

- `php artisan db:seed --force` **sirf pehli deployment par**, strong `ADMIN_PASSWORD` set karne ke baad chalayein. Existing live database par backup/review ke bina seeder dobara na chalayein.
- Public frontend ko build karne se **pehle** root `.env` mein production URLs set karein (domain ko apne canonical domain se replace karein):

  ```dotenv
  VITE_API_BASE_URL=https://api.example.com/api/v1
  VITE_SITE_URL=https://example.com
  ```

- Backend ke `backend/.env` mein `APP_URL` ko API domain, aur `FRONTEND_URL` ko public website origin par set karein. Agar frontend ke kai origins hain, unhein `CORS_ALLOWED_ORIGINS` mein comma-separated list ke roop mein dein. URL mein sahi `https://` scheme shamil karein.
- Phir frontend ko dobara `npm run build` karein aur generated `dist/` ko static web hosting par deploy karein. Laravel backend ko PHP 8.2+, Composer dependencies aur MySQL/MariaDB ke saath alag deploy karein.
- Uploaded images `backend/storage/app/public` mein rakhi jaati hain. Deployment ke baad `php artisan storage:link` chalayein aur uploads ko backup/persistent storage mein rakhein. Resume file private storage mein hoti hai; uska download API ke zariye hota hai.

## Aam problems

- **`could not find driver`** — PHP ka `pdo_mysql` extension enable karein; terminal/server restart karke `php -m` mein check karein.
- **Database connection/access denied** — MySQL service chal rahi ho aur `backend/.env` ke `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` sahi hon. Config badalne ke baad `cd backend; php artisan config:clear` chalayein.
- **Frontend API se connect nahi hota / CORS error** — root `.env` ka `VITE_API_BASE_URL` backend API URL se match karein. `backend/.env` mein `FRONTEND_URL` frontend origin se match hona chahiye; zarurat par `CORS_ALLOWED_ORIGINS` set karein. Environment badalne ke baad frontend dev server restart karein.
- **Admin seeder production mein password error deta hai** — `backend/.env` mein strong `ADMIN_PASSWORD` set karein aur phir `php artisan db:seed --force` chalayein.
- **Port pehle se use ho raha hai** — port `8000` ya `5173` use kar rahe doosre process ko band karein; frontend config strict port use karti hai.
- **Uploads ki images 404 deti hain** — backend directory se `php artisan storage:link` dobara chalayein aur web server ko storage files serve karne dein.

## API ke kuch endpoints

Base URL: `http://localhost:8000/api/v1`

- `GET /health` — API health check
- `GET /profile`, `/projects`, `/technologies`, `/experience`, `/services`, `/resume` — public portfolio data
- `POST /contact` — contact form submission
- `/admin/*` — admin API; login ke baad bearer token ke saath access hota hai

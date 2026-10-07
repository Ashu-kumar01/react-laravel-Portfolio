-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2026 at 01:56 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ak_portfolio`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('ashwani_kushwaha_portfolio_api_cache_623aad9e8140674c3f10420591b73140', 'i:2;', 1791373941),
('ashwani_kushwaha_portfolio_api_cache_623aad9e8140674c3f10420591b73140:timer', 'i:1791373941;', 1791373941),
('ashwani_kushwaha_portfolio_api_cache_7980917d1dc036183d39706691f46509', 'i:2;', 1791373941),
('ashwani_kushwaha_portfolio_api_cache_7980917d1dc036183d39706691f46509:timer', 'i:1791373941;', 1791373941),
('ashwani_kushwaha_portfolio_api_cache_a75f3f172bfb296f2e10cbfc6dfc1883', 'i:5;', 1791374150),
('ashwani_kushwaha_portfolio_api_cache_a75f3f172bfb296f2e10cbfc6dfc1883:timer', 'i:1791374150;', 1791374150),
('ashwani_kushwaha_portfolio_api_cache_f1f1dd371cf2bf9d4c0f9edfee7b39a8', 'i:1;', 1791360275),
('ashwani_kushwaha_portfolio_api_cache_f1f1dd371cf2bf9d4c0f9edfee7b39a8:timer', 'i:1791360274;', 1791360274),
('ashwani_kushwaha_portfolio_api_cache_f1f70ec40aaa556905d4a030501c0ba4', 'i:16;', 1791373947),
('ashwani_kushwaha_portfolio_api_cache_f1f70ec40aaa556905d4a030501c0ba4:timer', 'i:1791373947;', 1791373947),
('ashwani_kushwaha_portfolio_api_cache_portfolio.settings', 'a:24:{s:9:\"full_name\";s:22:\"Ashwani Kumar Kushwaha\";s:12:\"display_name\";s:16:\"Ashwani Kushwaha\";s:5:\"title\";s:32:\"Frontend & PHP/Laravel Developer\";s:7:\"tagline\";s:49:\"PHP • Laravel • React • REST APIs • MySQL\";s:8:\"headline\";s:133:\"I build responsive, scalable and user-focused web applications using modern frontend technologies, PHP, Laravel, REST APIs and MySQL.\";s:7:\"summary\";s:168:\"Frontend & PHP/Laravel developer from Raipur with 3.8+ years of experience and 30+ real-world websites — responsive UI, PHP/Laravel applications, REST APIs and MySQL.\";s:5:\"about\";s:793:\"I\'m a web developer with 3.8+ years of professional experience designing, developing and maintaining responsive, user-friendly web applications.\n\nMy core expertise covers HTML5, CSS3, JavaScript, Bootstrap, Tailwind CSS, PHP, Laravel, MySQL and REST APIs. I have worked on real-world websites, an educational ERP, business websites, dashboards and custom web applications — and contributed to 30+ websites across education, business, organisational and service domains.\n\nI enjoy turning UI/UX concepts into clean, responsive and functional interfaces, with a focus on performance, maintainability and user experience.\n\nRight now I\'m deepening my expertise in Laravel API development, React.js and full-stack architecture, and exploring Flutter and Dart for cross-platform mobile development.\";s:11:\"career_goal\";s:287:\"To grow as a skilled full-stack developer by combining strong frontend expertise with PHP, Laravel, REST APIs, database architecture and modern JavaScript — building scalable, secure, high-performance web applications, and expanding into cross-platform mobile development with Flutter.\";s:8:\"location\";s:27:\"Raipur, Chhattisgarh, India\";s:16:\"years_experience\";s:3:\"3.8\";s:14:\"websites_count\";s:2:\"30\";s:12:\"availability\";s:25:\"Open to new opportunities\";s:10:\"meta_title\";s:59:\"Ashwani Kumar Kushwaha — Frontend & PHP/Laravel Developer\";s:16:\"meta_description\";s:128:\"Frontend & PHP/Laravel developer in Raipur with 3.8+ years of experience: responsive UI, Laravel, REST APIs, MySQL and React.js.\";s:13:\"meta_keywords\";s:173:\"Frontend Developer, PHP Developer, Laravel Developer, PHP Laravel Developer, Full Stack Developer, React Developer, REST API Developer, UI UX Developer, Web Developer Raipur\";s:12:\"hero_eyebrow\";s:10:\"Hello, I\'m\";s:9:\"hero_name\";s:13:\"Ashwani Kumar\";s:9:\"hero_role\";s:18:\"Frontend Developer\";s:12:\"hero_summary\";s:98:\"Building modern, scalable and interactive web experiences with React, Laravel, PHP and JavaScript.\";s:11:\"hero_badges\";s:217:\"[{\"label\":\"React.js\",\"icon\":\"react\"},{\"label\":\"Laravel\",\"icon\":\"laravel\"},{\"label\":\"PHP\",\"icon\":\"php\"},{\"label\":\"JavaScript\",\"icon\":\"javascript\"},{\"label\":\"MySQL\",\"icon\":\"mysql\"},{\"label\":\"Three.js\",\"icon\":\"threejs\"}]\";s:20:\"hero_floating_badges\";s:198:\"[{\"value\":null,\"label\":\"Open to new opportunities\"},{\"value\":\"3.8+\",\"label\":\"Years of experience\"},{\"value\":\"30+\",\"label\":\"Websites & projects\"},{\"value\":null,\"label\":\"Raipur, Chhattisgarh, India\"}]\";s:17:\"hero_tech_bubbles\";s:38:\"[\"react\",\"laravel\",\"php\",\"javascript\"]\";s:10:\"hero_image\";s:49:\"settings/61ea962f-3011-4481-b961-a061240e2abf.jpg\";s:14:\"twitter_handle\";N;}', 2106733933);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `subject` varchar(190) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'new',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `experiences`
--

CREATE TABLE `experiences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'work',
  `company` varchar(160) NOT NULL,
  `position` varchar(160) NOT NULL,
  `location` varchar(160) DEFAULT NULL,
  `employment_type` varchar(40) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities`)),
  `technologies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`technologies`)),
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `experiences`
--

INSERT INTO `experiences` (`id`, `type`, `company`, `position`, `location`, `employment_type`, `start_date`, `end_date`, `is_current`, `description`, `responsibilities`, `technologies`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'work', 'Reliable Services', 'Web Designer', 'Raipur, Chhattisgarh, India', 'Full-time', '2022-10-17', '2025-10-18', 0, 'Designing, developing and maintaining responsive websites and PHP/Laravel web applications — contributing to 30+ websites across education, business, organisational and service domains.', '[\"Develop responsive websites and convert UI\\/UX designs into functional interfaces\",\"Develop dashboards and admin panels\",\"Debug, maintain and improve existing web applications\",\"Optimise frontend performance and test across screen sizes\",\"Use Git\\/GitHub on real-world client and company projects\"]', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"Bootstrap\",\"Tailwind CSS\",\"PHP\",\"Git\"]', 1, '2026-10-07 02:31:24', '2026-10-07 04:01:36'),
(2, 'education', 'Rungta College of Engineering and Technology, Raipur', 'B.Tech — Computer Science Engineering', 'Raipur, Chhattisgarh', NULL, '2018-01-01', '2022-01-01', 0, 'CGPA: 7.4 / 10', NULL, NULL, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(3, 'education', 'Saraswati Shishu Mandir, Ambikapur', 'Class 12', 'Ambikapur, Chhattisgarh', NULL, '2018-01-01', '2018-01-01', 0, 'Percentage: 69.4%', NULL, NULL, 2, '2026-10-07 02:31:24', '2026-10-07 02:31:24');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_10_06_070231_create_personal_access_tokens_table', 1),
(5, '2026_10_06_100000_create_projects_table', 1),
(6, '2026_10_06_100100_create_technologies_table', 1),
(7, '2026_10_06_100200_create_experiences_table', 1),
(8, '2026_10_06_100300_create_services_table', 1),
(9, '2026_10_06_100400_create_contact_messages_table', 1),
(10, '2026_10_06_100500_create_resumes_table', 1),
(11, '2026_10_06_100600_create_settings_table', 1),
(12, '2026_10_08_100000_add_show_demo_to_projects_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'admin-panel', '40eb5334f647dd39068e854f933635d31d19695d9bfc6e48dfea19c5706be31b', '[\"admin\"]', NULL, '2026-10-07 10:33:49', '2026-10-07 02:33:49', '2026-10-07 02:33:49'),
(2, 'App\\Models\\User', 1, 'admin-panel', 'd91eb1d331ad5b986a089ccd1e746c5bb6d9f2121a0e1a5e59a059a3cd8cb14c', '[\"admin\"]', NULL, '2026-10-07 10:44:25', '2026-10-07 02:44:25', '2026-10-07 02:44:25'),
(3, 'App\\Models\\User', 1, 'admin-panel', 'd48c82ede45b78623ddfc6300609e6af3d97a7765a9a2bd93a2312670e64839a', '[\"admin\"]', NULL, '2026-10-07 10:44:26', '2026-10-07 02:44:26', '2026-10-07 02:44:26'),
(4, 'App\\Models\\User', 1, 'admin-panel', '5d05c2e2592056e41a279164a245f1c90540840f5944c17762bcc85d2661767b', '[\"admin\"]', NULL, '2026-10-07 10:46:49', '2026-10-07 02:46:49', '2026-10-07 02:46:49'),
(5, 'App\\Models\\User', 1, 'admin-panel', '5e50d06519ef9240acf975c12b1d2e28058f0cd0ebe852bb0eb2bbb8b9429023', '[\"admin\"]', '2026-10-07 02:48:01', '2026-10-07 10:48:01', '2026-10-07 02:48:01', '2026-10-07 02:48:01'),
(6, 'App\\Models\\User', 1, 'admin-panel', 'cf0ad80a04b030202662866fe78867f5c18a2472da2d86c99776a055c44b3f18', '[\"admin\"]', '2026-10-07 03:58:38', '2026-10-07 11:58:37', '2026-10-07 03:58:37', '2026-10-07 03:58:38'),
(7, 'App\\Models\\User', 1, 'admin-panel', '422252f0d26f4319c9004e43b5edae105d1d2a9f6865bfff38e38f6d8dc6832e', '[\"admin\"]', '2026-10-07 05:07:59', '2026-10-07 11:59:05', '2026-10-07 03:59:05', '2026-10-07 05:07:59'),
(8, 'App\\Models\\User', 1, 'admin-panel', 'ee41f4f2673217902b6156f65fae5999d5a15047c7aa1da4ac6f62de48b07564', '[\"admin\"]', '2026-10-07 06:22:14', '2026-10-07 13:50:36', '2026-10-07 05:50:36', '2026-10-07 06:22:14'),
(9, 'App\\Models\\User', 1, 'admin-panel', 'ba33bb411bc78a6066889ab958b9abf0414aea5186a7edf022407424b67d9904', '[\"admin\"]', '2026-10-07 06:11:21', '2026-10-07 14:11:20', '2026-10-07 06:11:20', '2026-10-07 06:11:21'),
(10, 'App\\Models\\User', 1, 'admin-panel', '54773a6557f2129dd135d389d6ec77c27e018102c524025820389642b4bd0f69', '[\"admin\"]', '2026-10-07 06:11:27', '2026-10-07 14:11:26', '2026-10-07 06:11:26', '2026-10-07 06:11:27'),
(11, 'App\\Models\\User', 1, 'admin-panel', 'bb6d29607af011ccefbc31a9870b96e798c8266d4d212cce3c194a57fe1339d6', '[\"admin\"]', '2026-10-07 06:12:14', '2026-10-07 14:11:53', '2026-10-07 06:11:53', '2026-10-07 06:12:14'),
(12, 'App\\Models\\User', 1, 'admin-panel', 'b101cdbb0f86d835f4dc120deda2e5486b5bdc45913bc1e41d26e06c837810bf', '[\"admin\"]', '2026-10-07 06:12:12', '2026-10-07 14:11:56', '2026-10-07 06:11:56', '2026-10-07 06:12:12'),
(13, 'App\\Models\\User', 1, 'admin-panel', '116282e8101f8698843ceb15ace04510513e4d8a9838b439c697ffa3b4babfb1', '[\"admin\"]', '2026-10-07 06:19:40', '2026-10-07 14:19:39', '2026-10-07 06:19:39', '2026-10-07 06:19:40'),
(14, 'App\\Models\\User', 1, 'admin-panel', 'e280bf9201e39f5d605dd1237c812b65eba37d5dcc4f761f49eb86ad23c0c63d', '[\"admin\"]', '2026-10-07 06:21:35', '2026-10-07 14:21:22', '2026-10-07 06:21:22', '2026-10-07 06:21:35'),
(15, 'App\\Models\\User', 1, 'admin-panel', '2b7f63a957e451e685ec8c47776d3e070e6fecc1ed0ae322a3fbd1e249c410ac', '[\"admin\"]', '2026-10-07 06:21:30', '2026-10-07 14:21:25', '2026-10-07 06:21:25', '2026-10-07 06:21:30');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(160) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `short_description` varchar(300) NOT NULL,
  `description` longtext DEFAULT NULL,
  `category` varchar(80) NOT NULL,
  `client` varchar(160) DEFAULT NULL,
  `role` varchar(160) DEFAULT NULL,
  `technologies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`technologies`)),
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `featured_image` varchar(255) DEFAULT NULL,
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery`)),
  `live_url` varchar(500) DEFAULT NULL,
  `show_demo` tinyint(1) NOT NULL DEFAULT 0,
  `github_url` varchar(500) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `title`, `slug`, `short_description`, `description`, `category`, `client`, `role`, `technologies`, `features`, `featured_image`, `gallery`, `live_url`, `show_demo`, `github_url`, `start_date`, `end_date`, `featured`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'OpenCompas Educational ERP', 'opencompas-educational-erp', 'Educational ERP platform for academic and administrative workflows — UI redesign, frontend development, PHP integration and usability improvements.', 'OpenCompas is an educational ERP platform designed to manage academic and administrative workflows.\n\nI contributed to redesigning the ERP user interface, building a responsive UI and improving usability. I worked within the existing PHP application, developing and modifying frontend modules and database-driven interfaces.', 'Educational ERP', NULL, 'Frontend & PHP Developer', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"PHP\",\"MySQL\"]', '[\"Redesigned the ERP user interface\",\"Developed a responsive UI\",\"Improved usability across modules\",\"Worked with the existing PHP application\",\"Developed and modified frontend modules\",\"Built database-driven interfaces\"]', NULL, NULL, NULL, 0, NULL, NULL, NULL, 1, 'published', 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24', NULL),
(2, 'Shri Rawatpura Sarkar University Website', 'shri-rawatpura-sarkar-university-website', 'University website with responsive layouts, content sections and interactive components optimised across devices.', 'Website for Shri Rawatpura Sarkar University. I worked on the website UI — responsive layouts, content sections and interactive components — and optimised the experience across devices.', 'University Website', 'Shri Rawatpura Sarkar University', 'Frontend Developer', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"Bootstrap\",\"PHP\"]', '[\"Website UI development\",\"Responsive layouts\",\"Content sections\",\"Interactive components\",\"Cross-device optimisation\"]', NULL, NULL, NULL, 0, NULL, NULL, NULL, 1, 'published', 2, '2026-10-07 02:31:24', '2026-10-07 02:31:24', NULL),
(3, 'Hexa Jobs Website', 'hexa-jobs-website', 'Job and recruitment platform — website UI, job-related interfaces and responsive layouts.', 'Hexa Jobs is a job and recruitment platform. I worked on the website UI and frontend development, including job-related interfaces and responsive layouts.', 'Job Portal', 'Hexa Jobs', 'Frontend Developer', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"Responsive Design\"]', '[\"Website UI\",\"Frontend development\",\"Job-related interfaces\",\"Responsive layouts\"]', NULL, NULL, NULL, 0, NULL, NULL, NULL, 1, 'published', 3, '2026-10-07 02:31:24', '2026-10-07 02:31:24', NULL),
(4, 'The Great India Raipur Website', 'the-great-india-raipur-website', 'Business / organisation website — frontend development, responsive UI and usability improvements.', 'Website for The Great India, Raipur. I handled frontend development and the responsive UI, implemented the website sections and worked on performance and usability improvements.', 'Business Website', 'The Great India, Raipur', 'Frontend Developer', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"Responsive Design\"]', '[\"Frontend development\",\"Responsive UI\",\"Website sections\",\"UI implementation\",\"Performance and usability improvements\"]', NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 'published', 4, '2026-10-07 02:31:24', '2026-10-07 02:31:24', NULL),
(5, 'MAIC College Website', 'maic-college-website', 'Educational website — development, responsive design and frontend components.', 'Website for MAIC College. I worked on website development, responsive design, UI implementation and frontend components.', 'Educational Website', 'MAIC College', 'Web Developer', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"Responsive Design\"]', '[\"Website development\",\"Responsive design\",\"UI implementation\",\"Frontend components\"]', NULL, NULL, NULL, 0, NULL, NULL, NULL, 1, 'published', 5, '2026-10-07 02:31:24', '2026-10-07 03:59:23', NULL),
(6, 'Munchhonn Website', 'munchhonn-website', 'Business website — frontend development, responsive layout and interactive components.', 'Business website for Munchhonn. I worked on frontend development, building a responsive website with UI implementation and interactive components.', 'Business Website', 'Munchhonn', 'Frontend Developer', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"Responsive Design\"]', '[\"Frontend development\",\"Responsive website\",\"UI implementation\",\"Interactive components\"]', NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 'published', 6, '2026-10-07 02:31:24', '2026-10-07 02:31:24', NULL),
(7, 'Fuel Save Website', 'fuel-save-website', 'Business / product website — frontend development, responsive UI and website components.', 'Business and product website for Fuel Save. I worked on frontend development, the responsive UI, website components and user interface implementation.', 'Business Website', 'Fuel Save', 'Frontend Developer', '[\"HTML5\",\"CSS3\",\"JavaScript\",\"Responsive Design\"]', '[\"Frontend development\",\"Responsive UI\",\"Website components\",\"User interface implementation\"]', NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 'published', 7, '2026-10-07 02:31:24', '2026-10-07 02:31:24', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `resumes`
--

CREATE TABLE `resumes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(160) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size` bigint(20) UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `download_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `short_description` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(40) NOT NULL DEFAULT 'code',
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `slug`, `short_description`, `description`, `icon`, `features`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Website Development', 'website-development', 'Responsive business, education and organisation websites — the kind I have built 30+ of.', NULL, 'globe', '[\"Responsive, cross-browser layouts\",\"Search-friendly structure\",\"Performance-minded frontend\"]', 1, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(2, 'UI/UX Design', 'uiux-design', 'Clean, modern interfaces designed in Figma and translated faithfully into code.', NULL, 'palette', '[\"Design-to-code implementation\",\"Dashboards, forms & landing pages\",\"Mobile-first responsive layouts\"]', 2, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(3, 'PHP Development', 'php-development', 'PHP web applications with CRUD, form handling, authentication and MySQL integration.', NULL, 'database', '[\"Core PHP applications\",\"MySQL database integration\",\"Maintenance & bug fixing\"]', 3, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(4, 'Laravel Backend Development', 'laravel-backend-development', 'Laravel applications built on MVC with routing, Eloquent, migrations, validation and authentication.', NULL, 'server', '[\"MVC architecture & Eloquent ORM\",\"Migrations, seeders & relationships\",\"Validation & authentication\"]', 4, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(5, 'REST API Development', 'rest-api-development', 'REST APIs in PHP and Laravel with validation, authentication and clean JSON responses.', NULL, 'api', '[\"Login \\/ register APIs\",\"Validated JSON responses\",\"Tested with Postman\"]', 5, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(6, 'React.js Development', 'reactjs-development', 'Component-based React interfaces connected to Laravel REST APIs.', NULL, 'code', '[\"Vite + React setup\",\"REST API integration\",\"Tailwind CSS styling\"]', 6, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(7, 'Admin Panel Development', 'admin-panel-development', 'Dashboards and admin panels with tables, forms, modals and CRUD workflows.', NULL, 'dashboard', '[\"Data tables & filters\",\"CRUD workflows\",\"Responsive admin UI\"]', 7, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(8, 'API Integration', 'api-integration', 'Connecting frontends to REST APIs and integrating third-party services.', NULL, 'plug', '[\"API consumption & response handling\",\"Laravel HTTP Client\",\"Error handling\"]', 8, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(9, 'Flutter UI Development', 'flutter-ui-development', 'Cross-platform mobile UI with Flutter and Dart — an area I am actively learning and building experience in.', NULL, 'smartphone', '[\"Widget-based UI\",\"API-connected screens\",\"Currently learning\"]', 9, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group` varchar(40) NOT NULL DEFAULT 'general',
  `key` varchar(80) NOT NULL,
  `value` text DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `group`, `key`, `value`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'profile', 'full_name', 'Ashwani Kumar Kushwaha', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(2, 'profile', 'display_name', 'Ashwani Kushwaha', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(3, 'profile', 'title', 'Frontend & PHP/Laravel Developer', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(4, 'profile', 'tagline', 'PHP • Laravel • React • REST APIs • MySQL', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(5, 'profile', 'headline', 'I build responsive, scalable and user-focused web applications using modern frontend technologies, PHP, Laravel, REST APIs and MySQL.', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(6, 'profile', 'summary', 'Frontend & PHP/Laravel developer from Raipur with 3.8+ years of experience and 30+ real-world websites — responsive UI, PHP/Laravel applications, REST APIs and MySQL.', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(7, 'profile', 'about', 'I\'m a web developer with 3.8+ years of professional experience designing, developing and maintaining responsive, user-friendly web applications.\n\nMy core expertise covers HTML5, CSS3, JavaScript, Bootstrap, Tailwind CSS, PHP, Laravel, MySQL and REST APIs. I have worked on real-world websites, an educational ERP, business websites, dashboards and custom web applications — and contributed to 30+ websites across education, business, organisational and service domains.\n\nI enjoy turning UI/UX concepts into clean, responsive and functional interfaces, with a focus on performance, maintainability and user experience.\n\nRight now I\'m deepening my expertise in Laravel API development, React.js and full-stack architecture, and exploring Flutter and Dart for cross-platform mobile development.', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(8, 'profile', 'career_goal', 'To grow as a skilled full-stack developer by combining strong frontend expertise with PHP, Laravel, REST APIs, database architecture and modern JavaScript — building scalable, secure, high-performance web applications, and expanding into cross-platform mobile development with Flutter.', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(9, 'profile', 'location', 'Raipur, Chhattisgarh, India', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(10, 'profile', 'years_experience', '3.8', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(11, 'profile', 'websites_count', '30', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(12, 'profile', 'availability', 'Open to new opportunities', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(13, 'seo', 'meta_title', 'Ashwani Kumar Kushwaha — Frontend & PHP/Laravel Developer', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(14, 'seo', 'meta_description', 'Frontend & PHP/Laravel developer in Raipur with 3.8+ years of experience: responsive UI, Laravel, REST APIs, MySQL and React.js.', 1, '2026-10-07 02:31:23', '2026-10-07 02:31:23'),
(15, 'seo', 'meta_keywords', 'Frontend Developer, PHP Developer, Laravel Developer, PHP Laravel Developer, Full Stack Developer, React Developer, REST API Developer, UI UX Developer, Web Developer Raipur', 1, '2026-10-07 06:02:52', '2026-10-07 06:02:52'),
(16, 'hero', 'hero_eyebrow', 'Hello, I\'m', 1, '2026-10-07 06:02:52', '2026-10-07 06:02:52'),
(17, 'hero', 'hero_name', 'Ashwani Kumar', 1, '2026-10-07 06:02:52', '2026-10-07 06:12:14'),
(18, 'hero', 'hero_role', 'Frontend Developer', 1, '2026-10-07 06:02:52', '2026-10-07 06:02:52'),
(19, 'hero', 'hero_summary', 'Building modern, scalable and interactive web experiences with React, Laravel, PHP and JavaScript.', 1, '2026-10-07 06:02:52', '2026-10-07 06:02:52'),
(20, 'hero', 'hero_badges', '[{\"label\":\"React.js\",\"icon\":\"react\"},{\"label\":\"Laravel\",\"icon\":\"laravel\"},{\"label\":\"PHP\",\"icon\":\"php\"},{\"label\":\"JavaScript\",\"icon\":\"javascript\"},{\"label\":\"MySQL\",\"icon\":\"mysql\"},{\"label\":\"Three.js\",\"icon\":\"threejs\"}]', 1, '2026-10-07 06:02:52', '2026-10-07 06:12:14'),
(21, 'hero', 'hero_floating_badges', '[{\"value\":null,\"label\":\"Open to new opportunities\"},{\"value\":\"3.8+\",\"label\":\"Years of experience\"},{\"value\":\"30+\",\"label\":\"Websites & projects\"},{\"value\":null,\"label\":\"Raipur, Chhattisgarh, India\"}]', 1, '2026-10-07 06:02:52', '2026-10-07 06:02:52'),
(22, 'hero', 'hero_tech_bubbles', '[\"react\",\"laravel\",\"php\",\"javascript\"]', 1, '2026-10-07 06:02:52', '2026-10-07 06:02:52'),
(23, 'hero', 'hero_image', 'settings/61ea962f-3011-4481-b961-a061240e2abf.jpg', 1, '2026-10-07 06:12:01', '2026-10-07 06:22:13'),
(24, 'seo', 'twitter_handle', NULL, 1, '2026-10-07 06:13:27', '2026-10-07 06:13:27');

-- --------------------------------------------------------

--
-- Table structure for table `technologies`
--

CREATE TABLE `technologies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(80) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `category` varchar(30) NOT NULL,
  `proficiency` varchar(20) NOT NULL DEFAULT 'intermediate',
  `icon_path` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `technologies`
--

INSERT INTO `technologies` (`id`, `name`, `slug`, `category`, `proficiency`, `icon_path`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'HTML5', 'html5', 'frontend', 'advanced', NULL, 1, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(2, 'CSS3', 'css3', 'frontend', 'advanced', NULL, 2, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(3, 'JavaScript', 'javascript', 'frontend', 'advanced', NULL, 3, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(4, 'Bootstrap', 'bootstrap', 'frontend', 'advanced', NULL, 4, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(5, 'Tailwind CSS', 'tailwind-css', 'frontend', 'intermediate', NULL, 5, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(6, 'SCSS', 'scss', 'frontend', 'intermediate', NULL, 6, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(7, 'jQuery', 'jquery', 'frontend', 'intermediate', NULL, 7, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(8, 'React.js', 'reactjs', 'frontend', 'learning', NULL, 8, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(9, 'PHP', 'php', 'backend', 'advanced', NULL, 1, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(10, 'Laravel', 'laravel', 'backend', 'intermediate', NULL, 2, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(11, 'REST API', 'rest-api', 'backend', 'intermediate', NULL, 3, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(12, 'MySQL', 'mysql', 'database', 'advanced', NULL, 1, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(13, 'UI Development', 'ui-development', 'design', 'advanced', NULL, 1, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(14, 'Responsive Design', 'responsive-design', 'design', 'advanced', NULL, 2, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(15, 'UI/UX Design', 'ui-ux-design', 'design', 'intermediate', NULL, 3, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(16, 'Web Design', 'web-design', 'design', 'intermediate', NULL, 4, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(17, 'Git', 'git', 'tools', 'intermediate', NULL, 1, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(18, 'GitHub', 'github', 'tools', 'intermediate', NULL, 2, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(19, 'VS Code', 'vs-code', 'tools', 'intermediate', NULL, 3, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(20, 'Sublime Text', 'sublime-text', 'tools', 'intermediate', NULL, 4, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(21, 'Chrome DevTools', 'chrome-devtools', 'tools', 'intermediate', NULL, 5, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(22, 'Postman', 'postman', 'tools', 'intermediate', NULL, 6, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(23, 'Figma', 'figma', 'tools', 'intermediate', NULL, 7, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(24, 'npm', 'npm', 'tools', 'intermediate', NULL, 8, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(25, 'Composer', 'composer', 'tools', 'intermediate', NULL, 9, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(26, 'Vite', 'vite', 'tools', 'learning', NULL, 10, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(27, 'Flutter', 'flutter', 'mobile', 'learning', NULL, 1, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24'),
(28, 'Dart', 'dart', 'mobile', 'learning', NULL, 2, 1, '2026-10-07 02:31:24', '2026-10-07 02:31:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `is_admin`, `last_login_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Ashwani Kumar Kushwaha', 'Admin', 'admin@example.com', '2026-10-07 02:31:23', '$2y$12$.r..JdardbgMFr3vXT9VsO54ZePNx/RWYt6c.7u4gDq4NHcv5ym6i', 1, '2026-10-07 06:21:25', NULL, '2026-10-07 02:31:23', '2026-10-07 06:21:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_messages_status_created_at_index` (`status`,`created_at`),
  ADD KEY `contact_messages_email_index` (`email`);

--
-- Indexes for table `experiences`
--
ALTER TABLE `experiences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiences_type_index` (`type`),
  ADD KEY `experiences_sort_order_index` (`sort_order`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `projects_slug_unique` (`slug`),
  ADD KEY `projects_status_sort_order_index` (`status`,`sort_order`),
  ADD KEY `projects_featured_status_index` (`featured`,`status`),
  ADD KEY `projects_category_index` (`category`);

--
-- Indexes for table `resumes`
--
ALTER TABLE `resumes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resumes_uploaded_by_foreign` (`uploaded_by`),
  ADD KEY `resumes_is_active_index` (`is_active`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_slug_unique` (`slug`),
  ADD KEY `services_is_active_sort_order_index` (`is_active`,`sort_order`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`),
  ADD KEY `settings_group_index` (`group`);

--
-- Indexes for table `technologies`
--
ALTER TABLE `technologies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `technologies_slug_unique` (`slug`),
  ADD KEY `technologies_is_active_category_sort_order_index` (`is_active`,`category`,`sort_order`),
  ADD KEY `technologies_category_index` (`category`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_is_admin_index` (`is_admin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `experiences`
--
ALTER TABLE `experiences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `resumes`
--
ALTER TABLE `resumes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `technologies`
--
ALTER TABLE `technologies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `resumes`
--
ALTER TABLE `resumes`
  ADD CONSTRAINT `resumes_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

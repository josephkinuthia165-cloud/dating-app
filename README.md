# 💗 BloomMatch Dating App

A fully responsive dating website built with **React + Vite + Supabase**.

---

## ✨ Features

- 🔓 **Public browsing** – anyone can view profiles without an account
- 🔍 **Filters** – by gender (Male, Female, Trans) and city (Nairobi, Mombasa, Kisumu)
- 💌 **Profile cards** – image, name, contact, location, WhatsApp & Call buttons
- 📸 **Detail page** – up to 4 photos, age, gender, services offered
- 🔐 **Auth** – email/password signup & login via Supabase
- 🧑‍💼 **Dashboard** – create/edit profile with image uploads
- 📱 **Fully responsive** – mobile-first design

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) account

### 2. Clone & Install
```bash
cd dating-app
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Open the **SQL Editor** and paste & run the contents of `supabase_setup.sql`
3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### 4. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Run
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.jsx     # Global auth state
├── components/
│   ├── Navbar.jsx          # Navigation + filters
│   └── ProfileCard.jsx     # Card component
├── pages/
│   ├── Home.jsx            # Cards grid
│   ├── ProfileDetail.jsx   # Full profile view
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Dashboard.jsx       # Profile management
├── supabaseClient.js       # Supabase init
├── App.jsx                 # Router
└── index.css               # All styles
```

---

## 🗄️ Database Schema

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Auth user FK |
| name | text | Display name |
| location | text | Nairobi / Mombasa / Kisumu |
| contact | text | Phone number |
| age | int | Must be 18+ |
| gender | text | Male / Female / Trans |
| services_offered | text | Comma-separated |
| profile_image | text | Main photo URL |
| photo_1–3 | text | Extra photo URLs |
| created_at | timestamptz | Auto |

---

## 🔐 Supabase Storage

- Bucket: **`profile-images`** (must be public)
- Uploaded images are stored at: `{user_id}/{field}_{timestamp}.ext`

---

## 🏗️ Build for Production

```bash
npm run build
```
Output in `dist/`. Deploy to **Vercel**, **Netlify**, or any static host.

For Vercel, add your environment variables in the Vercel dashboard.

---

## 🎨 Tech Stack

- **React 18** + React Router v6
- **Vite** (build tool)
- **Supabase** (auth + database + storage)
- **react-icons** (Feather icons)
- **Cormorant Garamond** + **DM Sans** fonts

# Aurahub 🎬

Aurahub is a modern, premium video-sharing platform built with **Next.js 15**, **React 19**, and **Tailwind CSS v4**. Designed with a cinematic aesthetic and highly polished user experience, it features a comprehensive suite of tools for both viewers and creators.

## ✨ Key Features

### For Viewers
* **Immersive Video Player**: Beautiful viewing experience with likes, comments, and related videos.
* **Subscriptions Feed**: A dedicated feed to keep up with your favorite creators.
* **Custom Playlists**: Create public or private playlists to curate your favorite content.
* **Watch Later & History**: Automatically track what you watch and save videos for later.
* **Search & Discovery**: Robust search autocomplete and categorical filtering to find what you want fast.

### For Creators
* **Creator Studio / Dashboard**: A professional tabbed dashboard featuring:
  * **Analytics Overview**: View lifetime stats, 30-day channel growth (interactive charts), and video performance comparisons.
  * **Content Manager**: Edit video metadata, upload custom thumbnails, and toggle video visibility (Public/Unlisted/Private).
* **Public Profiles**: Highly customizable creator profiles featuring a 16:9 cinematic channel banner and custom bios.
* **Video Uploads**: Secure and seamless video uploading.

### Premium UI/UX
* **Dark Mode First**: Beautiful, class-based dark mode implementation with seamless theme toggling.
* **Cinematic Typography**: Uses `Outfit` (geometric sans-serif) for striking headers and `Inter` for highly legible body copy.
* **Micro-Animations**: Fluid transitions and hover effects powered by `framer-motion`.
* **Responsive Design**: Flawless layout across mobile, tablet, and desktop devices.

## 🛠 Tech Stack

* **Framework**: Next.js 15 (App Router)
* **Library**: React 19
* **Styling**: Tailwind CSS v4
* **Database**: MongoDB (via Mongoose)
* **Authentication**: NextAuth.js
* **Data Fetching**: SWR (stale-while-revalidate)
* **Caching**: Redis (via Upstash)
* **Charts**: Chart.js (`react-chartjs-2`)
* **Animations**: Framer Motion
* **Forms**: React Hook Form + Yup
* **State Management**: Zustand
* **Icons**: React Icons

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine. You will also need a MongoDB database and optionally a Redis database (for caching).

### 1. Clone the repository
```bash
git clone https://github.com/divyanshmehta355/aurahub.git
cd aurahub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory and add the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: For Redis Caching (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

* `/src/app`: Next.js App Router pages and API routes.
* `/src/components`: Reusable UI components (Navbar, VideoCard, AnalyticsChart, etc.).
* `/src/models`: Mongoose database schemas (User, Video, Playlist, etc.).
* `/src/lib`: Utility functions (API client, fetcher, dbConnect).
* `/src/hooks`: Custom React hooks.
* `/src/store`: Zustand state stores.

## 🤝 Contributing
Contributions, issues and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).

# EnVote 🗳️

> A modern, real-time polling and voting platform that brings your audience together

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)

## ✨ Overview

EnVote is an interactive polling and quiz platform designed to engage audiences in real-time. Perfect for events, classrooms, meetings, and live streams, EnVote makes it easy to create engaging voting sessions with instant results.

### 🎯 Key Features

- **🔄 Real-time Results**: See votes and responses update instantly as participants engage
- **👥 Easy Participation**: Simple join process with just a name and email - no app downloads required
- **📊 Live Statistics**: Beautiful real-time charts and statistics perfect for presentations
- **📱 Mobile First**: Optimized for mobile devices with touch-friendly interface
- **🌍 Global Scale**: Powered by Cloudflare's global network for ultra-low latency
- **🔒 Secure**: Built-in authentication and secure voting mechanisms

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account (for authentication)
- Cloudflare account (for real-time features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aksisonline/EnVote.git
cd EnVote
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Architecture

EnVote is built with modern web technologies for performance and scalability:

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Supabase Auth
- **Real-time**: Cloudflare Workers with Durable Objects
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Vercel (frontend) + Cloudflare Workers (backend)

## 📖 Usage

### Creating an Event

1. **Sign up** or **sign in** to your account
2. **Click "Create Your First Event"** on the homepage
3. **Fill in event details**:
   - Event name (used in URL)
   - Event title (displayed to participants)
   - Description (optional)
   - Maximum vote balance per participant
4. **Click "Create Event"** to generate your unique event URL

### Joining an Event

Participants can join by:
1. **Visiting the event URL** (e.g., `yoursite.com/event-name`)
2. **Entering their name and email**
3. **Starting to vote** immediately

### Managing Events

Event creators can:
- **View real-time participant activity**
- **Monitor voting statistics**
- **Create and manage polls/questions**
- **Export results and analytics**

## 🛠️ Development

### Project Structure

```
EnVote/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── create/            # Event creation page
│   ├── dashboard/         # User dashboard
│   └── [eventName]/       # Dynamic event pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configs
├── migrations/            # Database migrations
├── public/               # Static assets
└── src/                  # Cloudflare Worker source
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Setting up Cloudflare Workers

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy the worker:
```bash
wrangler deploy
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Real-time features powered by [Cloudflare Workers](https://workers.cloudflare.com/)

---

Made with ❤️ for better audience engagement

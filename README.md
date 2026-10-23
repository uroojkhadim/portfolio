# Urooj Khadim — Developer Portfolio

A modern, premium, fully responsive personal developer portfolio with a functional backend, persistent message storage, real-time WhatsApp notifications, and an interactive personal AI assistant.

Built with **React 18**, **Vite**, **Tailwind CSS**, and **Framer Motion**.

---

## 🌟 Key Features

1. **Modern Hero & About**:
   - Polished personal introduction highlighting software engineering education at **COMSATS University Islamabad (Vehari Campus)**.
   - Interactive CV preview and direct download of `/cv/Urooj_Khadim_CV.pdf`.
2. **Experience & Internship Section**:
   - Structured internship and practical software delivery timeline.
   - Built-in certificate viewing modal and download support.
   - Simple configuration in `src/data/experience.js` with drop-in certificate folder `public/certificates/`.
3. **Organized Projects Gallery**:
   - **Flutter & Mobile Applications**: Strict card view showing Project Name, 2–3 line concise description, and AI-generated project purpose image.
   - **Web Development Projects**: Strict card view showing Project Name, project purpose image, and verified working **Live Demo** button opening safely in a new tab.
4. **Skills & Core Competencies**:
   - Organized by practical categories (Programming, Web Development, Mobile Development, Databases, AI/ML, and Development Tools).
   - Clean, professional pill layout without arbitrary progress bar percentages.
5. **Interactive Learning Roadmap**:
   - 3 career tracks: **Flutter & Mobile**, **Full-Stack Web**, and **AI & Machine Learning**.
   - Clear stage progression (Mastered, Current Focus, Upcoming Stage) with milestone checklists.
6. **Personal AI Chatbot**:
   - Floating interactive assistant grounded in verified portfolio facts.
   - Powered by Google Gemini 1.5 Flash (when configured) with zero-failure semantic knowledge-base fallback.
   - Keyboard accessible (Escape to close, Enter to send) with suggested query chips.
7. **Functional Contact Form & Real-Time WhatsApp Notifications**:
   - Validated fields: Name, Email (regex), Subject, Message (min 10 chars).
   - Honeypot spam bot detection & duplicate submission protection.
   - Persistent message storage in `server/data/messages.json`.
   - Real-time WhatsApp notifications to your phone (supports Meta Cloud API, Twilio, and CallMeBot).
   - Resilient design: notification failure never loses the visitor's message.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS 3, Framer Motion 11, Lucide React
- **Build Tool**: Vite 6
- **Backend API**: Serverless Functions (`/api/contact`, `/api/chat`) with Vite dev middleware & standalone Node server (`server.js`)
- **Storage**: Persistent JSON database (`server/data/messages.json`)
- **Notifications**: Meta WhatsApp Business Cloud API / Twilio / CallMeBot Gateway
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`) with verified portfolio semantic fallback

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The portfolio works 100% out of the box even without adding any API keys!)*

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. The Vite development server automatically intercepts `/api/contact` and `/api/chat`.

### 4. Build for Production
```bash
npm run build
```

### 5. Run Standalone Node Server
```bash
npm start
```

---

## 📱 Real-Time WhatsApp Notification Setup

When a visitor submits the contact form, a notification is sent to your WhatsApp number. You can choose any of the following 3 options:

### Option A: CallMeBot Gateway (Free, 60-second setup — Recommended for Personal Use)
1. Add the CallMeBot number to your phone contacts: `+34 644 44 20 89`.
2. Send this exact message from your WhatsApp:
   ```text
   I allow callmebot to send me messages
   ```
3. CallMeBot will reply with your free API key (e.g. `1234567`).
4. In your `.env` (or Vercel environment variables), set:
   ```env
   WHATSAPP_RECIPIENT_PHONE=+923136576128
   CALLMEBOT_PHONE=+923136576128
   CALLMEBOT_API_KEY=your_api_key_here
   ```
5. Done! You will now receive instant alerts whenever someone contacts you.

### Option B: Meta WhatsApp Business Cloud API (Official Meta API)
1. Go to [Meta for Developers](https://developers.facebook.com/) and create a Business App.
2. Under Products, add **WhatsApp** and click **API Setup**.
3. Note your **Phone number ID** and generate a **System User Access Token**.
4. Set in `.env`:
   ```env
   WHATSAPP_TOKEN=your_meta_system_user_access_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_RECIPIENT_PHONE=+923136576128
   ```

### Option C: Twilio WhatsApp API
1. Create a free account at [Twilio](https://console.twilio.com/).
2. Activate the Twilio Sandbox for WhatsApp.
3. Set in `.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   WHATSAPP_RECIPIENT_PHONE=+923136576128
   ```

---

## 🤖 Google Gemini AI Chatbot Setup (Optional)

The chatbot has an intelligent, verified knowledge-base engine built-in. If you also want it powered by Google Gemini generative AI:

1. Visit [Google AI Studio](https://aistudio.google.com/) and create a free API key.
2. In `.env` (or deployment settings), add:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Cost: **Free Tier** includes 15 requests per minute, which is 100% free of charge for developer portfolios.

---

## 🌐 Deployment Instructions

### Deploying to Vercel (Recommended)
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your `portfolio` repository.
4. In the **Environment Variables** section, add your `.env` variables (`WHATSAPP_RECIPIENT_PHONE`, `CALLMEBOT_API_KEY`, etc.).
5. Click **Deploy**. Vercel will automatically build the React app and deploy `/api/contact` and `/api/chat` as native Serverless Functions!

### Deploying to Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. Set build command: `npm run build`.
3. Set publish directory: `dist`.
4. Configure environment variables in Site settings -> Environment variables.

---

## 📜 Project Structure

```
portfolio/
├── api/                         # Production Serverless API routes
│   ├── chat.js                  # POST /api/chat endpoint
│   └── contact.js               # POST /api/contact endpoint
├── public/
│   ├── certificates/            # Official certificates directory
│   ├── cv/                      # Urooj_Khadim_CV.pdf
│   └── images/projects/         # High-resolution project visual assets
├── server/
│   ├── data/messages.json       # Persistent contact submissions store
│   └── services/
│       ├── storage.js           # Rate limiting & message persistence
│       └── whatsapp.js          # Multi-provider WhatsApp alert engine
├── src/
│   ├── components/
│   │   ├── chat/Chatbot.jsx     # Floating interactive AI assistant
│   │   ├── layout/              # Navbar, Footer
│   │   ├── sections/            # Hero, About, Skills, Experience, Projects, Roadmap, Resume, Contact
│   │   └── ui/                  # Shared UI components
│   ├── data/
│   │   ├── chatbotKnowledge.js  # Grounded knowledge base facts
│   │   ├── cv.js                # Official CV configuration
│   │   ├── experience.js        # Internship & certificate configuration
│   │   ├── mobileProjects.js    # Flutter projects (Strict card layout)
│   │   ├── personal.js          # Bio, contact, education, navigation
│   │   ├── projects.js          # Web projects with live links
│   │   ├── roadmap.js           # 3 learning & career tracks
│   │   └── skills.js            # Organized competencies
│   ├── App.jsx
│   └── main.jsx
├── server.js                    # Standalone Node.js production server
├── vite.config.js               # Vite config with API dev server middleware
└── package.json
```

## 📄 License

MIT License © Urooj Khadim

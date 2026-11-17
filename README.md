# 🏥 MedBot — AI Healthcare Chatbot Platform

A full-stack, production-ready AI-powered healthcare assistant with medicine reminders, doctor discovery, health analytics, multilingual support, and smart AI features.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Socket.io |
| **Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit, Framer Motion |
| **AI** | Google Gemini 1.5 Flash |
| **Auth** | JWT (Access + Refresh tokens) |
| **Storage** | Cloudinary |
| **SMS** | Twilio |
| **Notifications** | Firebase FCM |
| **OCR** | Tesseract.js |
| **Translation** | Google Translate API |
| **Deployment** | Docker, Docker Compose |

---

## ✨ Features

| # | Feature |
|---|---------|
| 1 | 🤖 AI Healthcare Chatbot (Gemini 1.5) |
| 2 | 💊 Medicine Reminder System with SMS |
| 3 | 👨‍⚕️ Doctor Directory & Appointment Booking |
| 4 | 🔬 Disease Info + AI Symptom Checker |
| 5 | 🆘 Emergency SOS with Live Location |
| 6 | 📊 Health Risk Analyzer & Dashboard |
| 7 | 🧠 Mood Tracker + Meditation Guide |
| 8 | 📄 Medical Report Scanner (OCR + AI) |
| 9 | 🌍 6-Language Support (EN, HI, ES, FR, AR, BN) |
| 10 | 🌙 Dark/Light Mode |
| 11 | 🔔 Push Notifications (Firebase) |
| 12 | 🛡️ Admin Panel with Analytics |

---

## 📦 Project Structure

```
chatai/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/          # DB, Cloudinary config
│   │   ├── controllers/     # Route handlers (11)
│   │   ├── middleware/      # Auth, error, upload, rate limiter
│   │   ├── models/          # 9 Mongoose schemas
│   │   ├── routes/          # Express routers (11)
│   │   ├── services/        # AI, SMS, OCR, translate, notifications, cron
│   │   ├── socket/          # Socket.io real-time chat
│   │   └── utils/           # Logger
│   └── server.js
│
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── api/             # Axios client
│       ├── components/      # Layout, UI, Doctor, Chat
│       ├── context/         # Auth, Theme, Language
│       ├── i18n/            # 6 language JSON files
│       ├── pages/           # 11 pages
│       └── store/           # Redux + 6 slices
│
└── docker-compose.yml
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm / yarn

### 1. Clone & Setup

```bash
cd chatai
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Required
MONGO_URI=mongodb://localhost:27017/healthcare_chatbot
JWT_SECRET=your_secret_here

# AI (Required for chatbot)
GEMINI_API_KEY=your_gemini_api_key

# Optional (features work in mock mode without these)
TWILIO_ACCOUNT_SID=...
CLOUDINARY_CLOUD_NAME=...
FIREBASE_PROJECT_ID=...
GOOGLE_TRANSLATE_API_KEY=...
```

> **Note:** The app runs with graceful fallbacks when optional API keys are missing. Only `GEMINI_API_KEY` is needed for full AI functionality.

---

## 🐳 Docker Deployment

```bash
# Copy env file
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

# Build and start all services
docker-compose up --build -d
```

Services:
- MongoDB: port 27017
- Backend API: port 5000
- Frontend (Nginx): port 80

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/chat/message` | Send AI chat message |
| GET | `/api/chat/sessions` | Get chat history |
| POST | `/api/chat/symptom-check` | AI symptom analysis |
| GET | `/api/doctors` | Search doctors |
| GET | `/api/doctors/:id` | Doctor profile |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/medicines` | Get medicines |
| POST | `/api/medicines` | Add medicine |
| POST | `/api/medicines/:id/log` | Log dose |
| GET | `/api/diseases` | Search diseases |
| POST | `/api/diseases/predict` | AI disease prediction |
| GET | `/api/health/dashboard` | Health dashboard |
| POST | `/api/health/records` | Log health record |
| POST | `/api/health/risk-analysis` | AI risk analysis |
| POST | `/api/emergency/sos` | Trigger SOS |
| POST | `/api/upload/report` | Upload & scan report |
| GET | `/api/admin/stats` | Admin statistics |

---

## 🗃️ Database Collections

| Collection | Description |
|-----------|-------------|
| `users` | Patient/Doctor/Admin accounts |
| `doctors` | Doctor profiles & availability |
| `medicines` | Medicine reminders & logs |
| `appointments` | Booking records |
| `diseases` | Disease database |
| `healthrecords` | Vitals & lifestyle logs |
| `notifications` | In-app & push notifications |
| `emergencycontacts` | SOS contacts |
| `chathistory` | AI conversation sessions |

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| `patient` | All personal features |
| `doctor` | Profile management |
| `admin` | Full platform management |

**Demo credentials (create via register):**
- Register as patient, doctor, or admin

---

## 📱 Supported Languages

| Code | Language | RTL |
|------|----------|-----|
| `en` | English | No |
| `hi` | हिंदी | No |
| `es` | Español | No |
| `fr` | Français | No |
| `ar` | العربية | **Yes** |
| `bn` | বাংলা | No |

---

## 🛡️ Security Features

- JWT authentication (access + refresh tokens)
- Password hashing (bcrypt, 12 rounds)
- Rate limiting (200 req/15min global)
- MongoDB injection sanitization
- XSS protection (Helmet)
- Input validation (express-validator)
- Role-based access control

---

## 📊 Health Score System

The AI-powered health score (0–100) is calculated from:
- Blood pressure readings
- Blood sugar levels
- Sleep hours
- Water intake
- Exercise minutes
- Stress levels

---

## 🚀 Production Deployment

### Render/Railway (Backend)
1. Connect GitHub repo
2. Set environment variables
3. Build command: `npm install`
4. Start command: `node server.js`

### Vercel (Frontend)
1. Connect GitHub repo, select `frontend/`
2. Framework: Vite
3. Set `VITE_API_URL` env var

### AWS/DigitalOcean
Use `docker-compose.yml` for one-command deployment.

---

## 📝 License

MIT License — Free for personal and commercial use.

---

Built with ❤️ by the MedBot team | Powered by Google Gemini AI

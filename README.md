# Student Portfolio Repository (Folio)

A centralized digital portfolio and academic repository platform designed for university students to record, manage, and showcase verified personal profiles, academic milestones, technical skills, open-source projects, certifications, and internships through a modern, SaaS-grade interface.

---

## 🛠 Technology Stack

### Frontend
- **Framework & Tooling:** React 19, Vite 6
- **Styling & Design System:** Tailwind CSS (Dark-first, charcoal aesthetic, ambient glows, glassmorphism)
- **Animation & Motion:** Framer Motion (Page entrances, modal springs, staggered cards, smooth transitions)
- **Icons:** Lucide React & Custom SVG brand components
- **Data Visualizations:** Recharts (Category distribution bar chart & technical domain donut chart)
- **Routing:** React Router v7
- **HTTP Client:** Axios (Configured service layer with JWT interceptor)

### Backend
- **Runtime & Framework:** Node.js, Express.js
- **Database Driver:** MySQL (mysql2 with connection pooling)
- **Authentication:** JWT, bcryptjs
- **File Uploads:** Multer (Supporting PDF, PNG, JPG, JPEG documents)

---

## 📂 Project Architecture

```
student-portfolio-repository/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── assets/             # Media and static assets
│   │   ├── components/         # Reusable design system components
│   │   │   ├── Badge.jsx       # Category and status indicator badges
│   │   │   ├── Button.jsx      # Framer-motion interactive buttons
│   │   │   ├── Card.jsx        # Glassmorphic layered card containers
│   │   │   ├── EmptyState.jsx  # Reusable empty data states
│   │   │   ├── Icons.jsx       # Brand SVG icons (GitHub, LinkedIn)
│   │   │   ├── Input.jsx       # Form inputs with states & icons
│   │   │   ├── LoadingSkeleton.jsx # Shimmer loading skeletons
│   │   │   ├── Modal.jsx       # Animated accessible dialogs
│   │   │   ├── PageHeader.jsx  # Page headers with contextual action slots
│   │   │   ├── StatCard.jsx    # Metric statistic cards with gradients
│   │   │   └── Toast.jsx       # Dismissible notification banners
│   │   ├── hooks/              # Custom React hooks (e.g., useToast)
│   │   ├── layouts/            # Application layouts
│   │   │   └── DashboardLayout.jsx # Desktop sticky sidebar & mobile drawer
│   │   ├── pages/              # Application views & routes
│   │   │   ├── Achievements.jsx# Timeline-based milestones & credentials
│   │   │   ├── Certificates.jsx# Document uploads & verification cards
│   │   │   ├── Dashboard.jsx   # Primary student analytics overview
│   │   │   ├── Login.jsx       # Authentication sign-in
│   │   │   ├── Portfolio.jsx   # Professional interactive portfolio
│   │   │   ├── Profile.jsx     # Personal, academic, and bio editor
│   │   │   ├── Projects.jsx    # Project showcase cards with Add/Edit modals
│   │   │   ├── PublicPortfolio.jsx # Standalone recruiter-facing view
│   │   │   ├── Register.jsx    # Account onboarding
│   │   │   └── Skills.jsx      # Categorized skill bars & proficiency
│   │   ├── services/           # API service modules
│   │   │   └── api.js          # Configured Axios instance
│   │   ├── utils/              # Utility helpers
│   │   │   └── cn.js           # Class merging helper (clsx + tailwind-merge)
│   │   ├── App.jsx             # React Router routing configuration
│   │   ├── index.css           # Tailwind base styles and custom scrollbars
│   │   └── main.jsx            # React root mount
│   ├── tailwind.config.js      # Color tokens, glow utilities, and fonts
│   └── vite.config.js          # Vite server configuration (Port 5173)
│
├── server/                     # Express.js Backend API
│   ├── config/
│   │   └── database.js         # MySQL2 pool configuration
│   ├── controllers/            # Route controller handlers
│   │   ├── achievementController.js
│   │   ├── authController.js
│   │   ├── certificateController.js
│   │   ├── profileController.js
│   │   ├── projectController.js
│   │   └── skillController.js
│   ├── middleware/             # Express middlewares
│   │   ├── auth.js             # Token verification
│   │   └── upload.js           # Multer file upload filter (PDF, PNG, JPG)
│   ├── routes/                 # Express API routes
│   │   ├── achievementRoutes.js
│   │   ├── authRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── projectRoutes.js
│   │   └── skillRoutes.js
│   ├── uploads/                # Local uploaded supporting files
│   ├── utils/
│   │   └── helpers.js          # Standardized JSON response helpers
│   ├── .env                    # Environment configuration
│   ├── .env.example            # Environment sample template
│   └── server.js               # Application bootstrap & health checks
│
└── README.md                   # System documentation
```

---

## 🚀 Getting Started

### 1. Start the Frontend

Open a terminal in the project directory:

```bash
cd client
npm run dev
```

The frontend will be available at:
👉 **[http://localhost:5173](http://localhost:5173)**

### 2. Start the Backend Server

Open a second terminal in the project directory:

```bash
cd server
npm run dev
```

Or using standard Node:
```bash
npm start
```

The backend server will run on:
👉 **[http://localhost:5000](http://localhost:5000)**  
Health check endpoint: **[http://localhost:5000/api](http://localhost:5000/api)**

---

## 🧭 Routes & Prototype Features

| Route | Description |
|---|---|
| `/dashboard` | Primary student dashboard with completion score (82%), metric cards, Recharts category analytics, recent audit activity, and quick shortcuts |
| `/profile` | Two-column personal & academic info editor, headshot preview, professional links, and bio |
| `/projects` | Modern project cards with source code links, live demo links, search filtering, and Add/Edit project modal |
| `/achievements` | Interactive timeline of internships, certifications, awards, and research papers with category filters |
| `/skills` | Categorized technical competencies with animated progress bars (Beginner, Intermediate, Advanced, Expert) |
| `/certificates` | Certificate document gallery with file preview/download triggers and upload modal (PDF, PNG, JPG, JPEG) |
| `/portfolio` | Full personal portfolio preview with Hero, About, Skills, Projects, Experience, and Contact sections |
| `/portfolio/:username` | Standalone public recruiter view without private sidebar navigation, equipped with shareable link copy |
| `/login` | Dark-first authentication sign-in with pre-filled demo state |
| `/register` | New student registration portal |

---

## 🔒 Next Step: Database Integration

When requested, the backend will connect directly to the local MySQL database instance (`student_portfolio_repository` on `MySQL80`) utilizing the existing schema:
- `users`
- `profiles`
- `skills`
- `projects`
- `achievements`

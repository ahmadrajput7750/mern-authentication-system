# 🔐 MERN Authentication System

A full-stack, production-ready authentication system built using the **MERN Stack** (MongoDB, Express.js, React, Node.js). This application features local email/password authentication, **Google OAuth 2.0** social login, **JWT-based session management** via HTTP-only cookies, **OTP email verification**, and a **two-step password reset** workflow.

---

## ✨ Key Features

- **User Registration & Login:** Secure local authentication using `bcryptjs` password hashing.
- **Google OAuth 2.0 Integration:** Seamless one-click social login and account linking powered by `Passport.js`, automatically syncing the user's Google profile avatar and verification status.
- **JWT & HTTP-Only Cookies:** Stateless authentication stored securely in `httpOnly` cookies to protect against XSS attacks.
- **Account Email Verification:** 6-digit OTP sent via email (valid for 24 hours) with an interactive UI supporting auto-focus, backspace navigation, and clipboard pasting.
- **Password Recovery Flow:** Two-step password reset using a 6-digit email OTP (valid for 15 minutes).
- **Automated Transactional Emails:** Powered by `Nodemailer` and Brevo SMTP for welcome messages, login alerts, verification OTPs, and password reset codes.
- **Protected Routes & Auth Context:** Global state management on the frontend using React Context API (`AppContext`) with route guards and loading states.
- **Modern Responsive UI:** Built with React 19, Vite, Tailwind CSS v4, and `react-toastify` for real-time user feedback.

---

## 🛠️ Tech Stack

### Frontend (`client`)
- **Framework:** React 19 (via Vite 8)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios (configured with `withCredentials: true`)
- **Notifications:** React Toastify

### Backend (`server`)
- **Runtime & Framework:** Node.js & Express.js v5 (ES Modules)
- **Database:** MongoDB & Mongoose v9
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `passport`, `passport-google-oauth20`
- **Email Service:** Nodemailer (configured for Brevo SMTP relay)
- **Middleware:** `cors`, `cookie-parser`, `dotenv`

---

## 📂 Project Structure

```text
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static assets (bg_img.png, favicon, icons)
│   ├── src/
│   │   ├── assets/             # SVG icons, images, and asset exports
│   │   ├── components/
│   │   │   ├── Header.jsx      # Landing hero section with dynamic user greeting
│   │   │   └── Navbar.jsx      # Navigation bar with avatar dropdown & verification trigger
│   │   ├── context/
│   │   │   └── AppContext.jsx  # Global auth state, user data, and API configuration
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Main landing page
│   │   │   ├── Login.jsx       # Toggleable Sign Up / Login form + Google OAuth button
│   │   │   ├── VerifyEmail.jsx # 6-digit OTP email verification page
│   │   │   ├── ResetPassword.jsx # 2-step email & OTP password reset page
│   │   │   └── NotFound.jsx    # 404 fallback page
│   │   ├── App.jsx             # Application routes and ToastContainer
│   │   ├── main.jsx            # React DOM entry point with BrowserRouter & Context
│   │   └── index.css           # Tailwind CSS imports & global Outfit font styling
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Node.js & Express Backend
    ├── config/
    │   ├── mongoDB.js          # Mongoose database connection setup
    │   ├── nodemailer.js       # Brevo SMTP transporter configuration
    │   ├── passport.js         # Google OAuth 2.0 strategy & account linking logic
    │   └── emailTemplates.js   # Email template constants
    ├── controllers/
    │   ├── authController.js   # Registration, login, OAuth, OTPs, and password reset logic
    │   └── userController.js   # Fetching and deleting user profile data
    ├── middleware/
    │   └── userAuth.js         # JWT verification middleware from HTTP-only cookies
    ├── models/
    │   └── userModel.js        # Mongoose User schema
    ├── routes/
    │   ├── authRoutes.js       # /api/auth endpoints
    │   └── userRoutes.js       # /api/user endpoints
    ├── utils/
    │   ├── ExpressError.js     # Custom error class
    │   └── WrapAsync.js        # Async error handling wrapper
    ├── package.json
    └── server.js               # Express app entry point & middleware registration
```

---

## ⚙️ Environment Variables

To run this project locally, you need to configure environment variables for both the `server` and `client` directories.

### 1. Server (`server/.env`)
Create a `.env` file in the `server/` directory and provide the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection (Note the exact variable name used in config/mongoDB.js)
MONGODBDB_NONSRV_URI=mongodb://localhost:27017/mern-auth

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Nodemailer / Brevo SMTP Configuration
SMTP_USER=your_brevo_smtp_login
SMTP_PASSWORD=your_brevo_smtp_key
SENDER_EMAIL=verified_sender@yourdomain.com

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

> **Note on Google OAuth:** In your Google Cloud Console, configure the **Authorized redirect URI** to point to your backend callback route:
> `http://localhost:4000/api/auth/google/callback`

### 2. Client (`client/.env`)
Create a `.env` file in the `client/` directory and add your backend URL:

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Brevo Account** (for SMTP credentials)
- **Google Cloud Console Project** (for OAuth 2.0 Client ID and Secret)

### Installation & Run

1. **Clone the repository and navigate to the project root:**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. **Setup and start the Backend (`server`):**
   ```bash
   cd server
   npm install
   # Create and configure your .env file before starting
   npm run server
   ```
   *The backend server will start with `nodemon` on `http://localhost:4000` (or your specified `PORT`).*

3. **Setup and start the Frontend (`client`):**
   Open a new terminal window and run:
   ```bash
   cd client
   npm install
   # Create and configure your .env file before starting
   npm run dev
   ```
   *The Vite development server will start at `http://localhost:5173`.*

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`), set JWT cookie, and send a welcome email. |
| `POST` | `/api/auth/login` | Public | Authenticate user (`email`, `password`), set JWT cookie, and send a login alert email. |
| `POST` | `/api/auth/logout` | Public | Clear the `token` cookie and log out the user. |
| `GET` | `/api/auth/is-authenticated` | Protected | Verify if the current user's JWT cookie is valid. |
| `POST` | `/api/auth/send-verify-otp` | Protected | Generate a 6-digit verification OTP (24h expiry) and email it to the logged-in user. |
| `POST` | `/api/auth/verify-account` | Protected | Verify the user's account using the submitted `{ otp }`. |
| `POST` | `/api/auth/send-password-reset-otp`| Public | Send a 6-digit password reset OTP (15m expiry) to the provided `{ email }`. |
| `POST` | `/api/auth/reset-password` | Public | Verify `{ email, otp, password }` and update the user's password. |
| `GET` | `/api/auth/google` | Public | Redirect user to Google's OAuth 2.0 consent screen. |
| `GET` | `/api/auth/google/callback` | Public | Handle Google OAuth callback, issue JWT cookie, and redirect to `CLIENT_URL`. |

### User Routes (`/api/user`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/get-user-data` | Protected | Get the authenticated user's profile (`name`, `email`, `isAccountVerified`, `avatar`). |
| `DELETE` | `/api/user/delete-user` | Protected | Delete the authenticated user's account from MongoDB. |

---

## 💡 Developer Notes

- **Case-Sensitive Imports (Linux/Production):** In `server/controllers/authController.js`, the transporter is imported as `../config/nodeMailer.js`, while the actual filename is `server/config/nodemailer.js`. On case-sensitive file systems (like Linux deployment servers), ensure the import casing matches the filename (`../config/nodemailer.js`).
- **MongoDB URI Variable Name:** `server/config/mongoDB.js` specifically reads `process.env.MONGODBDB_NONSRV_URI` (with a double `DB`). Make sure your `.env` file uses that exact key name.
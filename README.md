# TalentSpark 🎯

An AI-powered mobile platform that democratizes sports talent assessment, allowing athletes to get verified fitness evaluations using just their smartphone camera.

This project is a submission for the Smart India Hackathon, addressing the challenge from the Sports Authority of India (SAI) of identifying athletic talent in remote areas by providing a low-cost, scalable, and secure solution for fitness verification.

---

## Demo Video

**Project Demo:** `[https://youtu.be/4PEOPoktXK8]`

## Links

* **GitHub Repository:** `https://github.com/Santhoshkumarp01`
* **Admin Panel:** `http://localhost:5173/#admin` (after running locally)

---

## Key Features

**AI-Powered Multi-Exercise Analysis**
The core monitoring system provides rep counts and analysis for key fitness tests including squats, pushups, vertical jumps, situps, and shuttle runs.

**Secure Face Verification**
Ensures the identity of the athlete performing the exercise to prevent cheating and maintain assessment integrity.

**Offline-First Progressive Web App (PWA)**
Built as a PWA with offline functionality, using WASM-optimized processing to work seamlessly on low-end smartphones with limited internet connectivity.

**Gamified User Experience**
Complete profile page, points system, unlockable badges for achievements, and competitive national leaderboard to motivate consistent participation.

**Operational Admin Dashboard**
Functional dashboard for officials to review and manage athlete submissions.

---

## Tech Stack

This is a monorepo containing frontend and backend applications.

**Frontend (Client-Side)**
* Framework: React with TypeScript
* AI/ML: On-device inference using TensorFlow.js and MediaPipe for pose estimation and face detection
* State Management: React Hooks & Context API
* Build Tool: Vite

**Backend (Server-Side)**
* Framework: FastAPI (Python)
* API Design: RESTful principles with Pydantic data validation
* Server: Uvicorn ASGI server

---

## Current Status

The core TalentSpark platform is operational and functional in a local environment.

✅ **Completed**
- AI Monitoring Engine for 5 core exercises (squat, pushup, vertical jump, situps, shuttle run)
- Frontend User Flow with all major screens (Home, Face Capture, Record, Review, Profile, Leaderboard)
- PWA & Offline Functionality
- Gamification System with profile, badges, and leaderboard features
- Admin Dashboard interface

🔄 **In Progress**
- Backend Integration for frontend submission flow to API endpoints
- Cloud Deployment to live server

---

## Local Development Setup

**Prerequisites**
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- pip and virtualenv

**1. Clone the Repository**
```bash
git clone https://github.com/Santhoshkumarp01/TalentSpark.git
cd TalentSpark
```

**2. Setup the Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be running at http://localhost:8000

**3. Setup the Frontend (New Terminal)**
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at http://localhost:5173
Admin panel: http://localhost:5173/#admin

**Note:** This application is currently running on localhost and requires local setup. No deployed version is available yet.

---

## How It Works

1. **Profile Setup** - User enters basic information on the home screen
2. **Face Capture** - One-time face capture creates secure baseline for identity verification
3. **Assessment Recording** - User records workout, app analyzes video in real-time or via upload
4. **AI Analysis** - System processes video on-device, counting reps, scoring form, and verifying user's face
5. **Review Results** - User gets instant feedback with grade, points, and any new badges unlocked
6. **Submission** - Verified results are packaged and prepared for submission to backend for official review

---

## Author

**Santhosh Kumar P**
- GitHub: https://github.com/Santhoshkumarp01
- LinkedIn: https://www.linkedin.com/in/santhoshkumarps1

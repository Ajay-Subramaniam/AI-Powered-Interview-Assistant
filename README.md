# CRISP-AI: AI-Powered Interview Assistant 

CRISP-AI is an AI-powered interview assistant built with **React** . It allows candidates to upload resumes, generates dynamic AI-driven interview questions, evaluates answers, and provides interviewers with a dashboard of candidates, detailed reports, and AI-generated summaries. A “Welcome Back” modal ensures that users can continue seamlessly from where they left off, using local persistence with **IndexedDB**.

 - Live link : [https://ai-powered-interview-assistant-9s19.onrender.com](https://ai-powered-interview-assistant-9s19.onrender.com) 
 - Demo video : [https://www.youtube.com/watch?v=AYJgRw_UHWM](https://www.youtube.com/watch?v=AYJgRw_UHWM)
---

## ✨ Features

###  Interviewee

- **Resume Upload**:  
  Supports PDF format (up to 10MB) with preview. AI extracts name, email, and phone, and prompts the candidate if any details are missing.

- **Dynamic Question Generation**:  
  AI generates 6 React/Node.js questions (2 easy, 2 medium, 2 hard) with timers. Answers are auto-submitted if time expires.

- **Persistence**:  
  All data is stored locally in **IndexedDB** so that sessions can be paused and resumed later from exactly where the candidate left off.

---

###  Interviewer

- **Dashboard**:  
  Displays all candidates with name, email, score, and interview date, with options to search by name and sort by different criteria.

- **Detailed Candidate View**:  
  Shows questions, answers, scores, chat history, uploaded resume, and an AI-generated summary of performance.

- **Scoring**:  
  Evaluations are based on **logical clarity**, **correctness**, and **quickness** of responses.

---

## 🛠️ Tech Stack

- **Frontend**: React  
- **UI Library**: Material UI (MUI)  
- **Data Persistence**: IndexedDB  

---

## ⚙️ Local Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Ajay-Subramaniam/AI-Powered-Interview-Assistant.git

cd AI-Powered-Interview-Assistant
```
#### 2. Install dependencies:
```bash
npm install
```

#### 3. Configure Google Gemini API :
   - Get your API key from Google AI Studio
   - Copy `.env.sample` to `.env`
   - Add your API key in `.env` 

#### 4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

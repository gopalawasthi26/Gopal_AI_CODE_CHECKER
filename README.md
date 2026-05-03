# 🔍 AI Code Reviewer
### Built by Gopal Awasthi | gopalawasthi26

AI-powered code review using **Google Gemini 2.0**, **FastAPI**, and **React.js**

---

## Run Karne Ke Steps

### Terminal 1 — Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # .env mein apni GEMINI_API_KEY daalo
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## Deploy on Render

**Backend Web Service:**
- Root: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Env Var: `GEMINI_API_KEY`

**Frontend Static Site:**
- Root: `frontend`
- Build: `npm install && npm run build`
- Publish: `dist`
- Env Var: `VITE_API_URL = your-backend-url`

---

**Contact:** gopalawasthi26 | GLA University | Cognizant

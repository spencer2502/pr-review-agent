# PR Review Agent

AI-powered Pull Request Review with GitHub integration

---

## 🚀 Live Demo

[Try the app live](https://pr-review-agent-ffy5.vercel.app)

## 📺 Video Implementation

[Watch the implementation video]
https://drive.google.com/file/d/12mJ10l85mjcUbdzvkhGN-QJ5L9cx7IC4/view?usp=drive_link

---

## Project Structure

```
pr-review-agent/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   ├── .env
│   ├── api/
│   │   └── routes/
│   └── ...
├── frontend/
│   ├── src/
│   │   └── App.js
│   ├── package.json
│   ├── .env
│   └── ...
```

---

## 🛠️ Backend Setup (FastAPI)

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Configure environment variables:**
   - Edit `.env` in `backend/` with your API keys and allowed origins.
3. **Run locally:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
4. **Deploy:**
   - Use Railway or Render. Set working directory to `backend` and use the start command:
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

---

## 🖥️ Frontend Setup (React)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Configure environment variables:**
   - Edit `.env` in `frontend/`:
     ```
     REACT_APP_API_URL=https://your-backend-url.up.railway.app
     ```
3. **Run locally:**
   ```bash
   npm start
   ```
4. **Deploy:**
   - Use Vercel. Set project root to `frontend` and add `REACT_APP_API_URL` in Vercel dashboard.

---

## 🔗 API Endpoints

- `/api/analysis/demo/{pr_id}`: Get demo PR analysis
- `/api/analysis`: Analyze PR
- `/api/chat`: Chat with mentor personas
- `/api/github`: Analyze GitHub PR
- `/health`: Health check
- `/`: API root

---

## ✨ Features

- Analyze pull requests for security, maintainability, and performance
- AI-powered mentor personas for code review
- Automated fix suggestions
- GitHub integration
- Demo mode for quick testing

---

## 📝 Environment Variables

### Backend (`backend/.env`)

- `GITHUB_TOKEN`: GitHub API token (optional)
- `GEMINI_API_KEY`: Gemini API key (optional)
- `ALLOWED_ORIGINS`: Allowed frontend URLs (comma-separated)

### Frontend (`frontend/.env`)

- `REACT_APP_API_URL`: Backend API URL

---

## 📄 License

MIT

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📧 Contact

For questions or support, open an issue or contact the maintainer.

---

## Credits

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/)

---

> **Note:** Replace `YOUR_VIDEO_ID` in the video link with your actual YouTube video ID.

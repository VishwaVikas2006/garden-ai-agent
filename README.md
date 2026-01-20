# 🌱 Garden AI Agent – Project Overview

## What is this project?

Garden AI Agent is a full-stack AI chatbot that provides organic gardening advice tailored for Indian climates.  
Users can chat naturally and receive AI-generated responses while conversation history is securely stored.

The project is built using modern full-stack technologies and runs entirely on free tiers.

---

## Tech Stack

### Frontend
- React 18
- Tailwind CSS (via CDN)
- Lucide Icons
- Fetch API

### Backend
- Node.js
- Express.js
- Axios
- MongoDB (Mongoose)
- Groq API (Llama 3.1 – free model)

### Database
- MongoDB Atlas (free tier)

---

## How It Works

1. User opens the React app
2. Sends a gardening question
3. Frontend sends request to backend API
4. Backend calls Groq Llama 3.1 model
5. AI response is returned
6. Conversation is saved in MongoDB
7. Response is displayed in the chat UI

---

## Key Features

- Real-time AI chat
- Organic gardening advice
- Indian climate focused responses
- Conversation history persistence
- Clean UI with auto-scroll
- Fully free stack

---

## Environment Variables

Secrets are stored securely using environment variables and are **never committed**.

```env
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
PORT=5000
NODE_ENV=development

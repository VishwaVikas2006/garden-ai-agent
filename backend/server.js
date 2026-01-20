// server.js - Backend for Garden Assistant AI Agent
// This uses Groq API (100% free alternative)

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://garden-ai-agent.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garden-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Chat History Schema
const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

// Groq API Integration (100% Free Alternative)
async function callGroqAPI(userMessage, conversationHistory) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY || GROQ_API_KEY.includes('your-key')) {
    throw new Error('Groq API key not configured');
  }

  const systemPrompt = `You are a helpful Garden Assistant AI for organic gardening advice in India. 
Provide organic gardening advice for Indian climate.
Recommend sustainable practices.
Help beginners start their gardening journey.
Suggest pest control, watering schedules, soil care.
Be friendly, encouraging, and use simple language.`;

  try {
    console.log('📤 Calling Groq API (Llama 3.1)...');
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversationHistory || []).map(msg => ({

            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 512

      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Got response from Groq (Llama 3.1)');
    return response.data.choices[0].message.content;
} catch (error) {
  console.error(
    '❌ Groq Error:',
    error.response?.data || error.message
  );
  throw error;
}

}

// API Routes

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Garden AI Agent API running',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      products: '/api/products'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Garden AI Agent API running' });
});

// Get chat history
app.get('/api/chat/:sessionId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ sessionId: req.params.sessionId });
    res.json(chat || { messages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message and get AI response
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    console.log('📨 Message received:', message);

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId required' });
    }

    // Get or create chat
    let chat = await Chat.findOne({ sessionId });
    if (!chat) {
      chat = new Chat({ sessionId, messages: [] });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    // Get Groq AI response

    const conversationHistory = chat.messages.slice(-10);
    const aiResponse = await callGroqAPI(message, conversationHistory);

    // Add AI response
    chat.messages.push({ role: 'assistant', content: aiResponse });
    await chat.save();

    console.log('✅ Response sent');
    res.json({
      response: aiResponse,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('❌ Error in /api/chat:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
});

// Clear chat history
app.delete('/api/chat/:sessionId', async (req, res) => {
  try {
    await Chat.deleteOne({ sessionId: req.params.sessionId });
    res.json({ message: 'Chat cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products
app.get('/api/products', (req, res) => {
  const products = [
    { name: "Organic Seed Starter Kit", price: 299, description: "Contains 10 varieties" },
    { name: "Vermicompost 5kg", price: 199, description: "Premium worm castings" },
    { name: "Neem Oil Spray 500ml", price: 149, description: "Natural pest control" },
    { name: "pH Testing Kit", price: 249, description: "Test soil pH accurately" }
  ];
  res.json(products);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available`);
});

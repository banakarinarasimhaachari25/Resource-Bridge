import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Gemini client initialization with mandatory User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Google Maps Grounding endpoint using gemini-3.8-flash
app.post('/api/maps/grounding', async (req, res) => {
  try {
    const { prompt, lat, lng } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A valid prompt string is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please configure your key in Secrets.',
      });
    }

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (typeof lat === 'number' && typeof lng === 'number') {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Error executing Maps Grounding with gemini-3.8-flash:', error);
    return res.status(500).json({
      error: error.message || 'Failed to query Google Maps grounding information.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ResourceBridge Full-Stack Server' });
});

async function startServer() {
  // Mount Vite middlewares for SPA rendering in development
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      port: PORT,
      host: '0.0.0.0',
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResourceBridge server running on port ${PORT}`);
  });
}

startServer();

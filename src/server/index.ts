import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { scrapeCompanyInfo } from './services/searchService.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

app.post('/api/company/search', async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const companyInfo = await scrapeCompanyInfo(companyName);
    res.json(companyInfo);
  } catch (error) {
    console.error('❌ Error searching company:', error);
    res.status(500).json({ error: 'Failed to search company information' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
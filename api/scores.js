import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const LB_KEY = 'battlecity:leaderboard';
const MAX_ENTRIES = 50;

async function getLeaderboard() {
  try {
    const data = await redis.get(LB_KEY);
    return data || [];
  } catch {
    return [];
  }
}

async function saveLeaderboard(data) {
  await redis.set(LB_KEY, data);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const lb = await getLeaderboard();
    return res.status(200).json(lb);
  }

  if (req.method === 'POST') {
    const { name, score, level, mode } = req.body;

    if (!name || typeof score !== 'number' || !level || !mode) {
      return res.status(400).json({ error: 'Missing fields: name, score, level, mode' });
    }

    // Sanitize
    const entry = {
      name: String(name).slice(0, 15).replace(/[<>&"']/g, ''),
      score: Math.max(0, Math.min(999999, Math.round(score))),
      level: Math.max(1, Math.min(40, Math.round(level))),
      mode: mode === '2P' ? '2P' : '1P',
      date: Date.now(),
    };

    const lb = await getLeaderboard();
    lb.push(entry);
    lb.sort((a, b) => b.score - a.score);
    const trimmed = lb.slice(0, MAX_ENTRIES);

    await saveLeaderboard(trimmed);

    const rank = trimmed.findIndex(e => e.date === entry.date && e.name === entry.name) + 1;
    return res.status(200).json({ rank, leaderboard: trimmed });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

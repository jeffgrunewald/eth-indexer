import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { getTransferStats } from '../../db/queries';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * @swagger
 * /api/stats:
 *   get:
 *     tags: [Stats]
 *     summary: Get transfer statistics
 *     description: Retrieve aggregate statistics about transfer events
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferStats'
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = await getTransferStats(pool);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching transfer stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
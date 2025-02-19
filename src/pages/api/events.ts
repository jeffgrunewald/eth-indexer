import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { getTransferEvents } from '../../db/queries';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Get transfer events
 *     description: Retrieve paginated transfer events with optional filtering
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Filter by sender address
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Filter by recipient address
 *       - in: query
 *         name: startBlock
 *         schema:
 *           type: integer
 *         description: Filter by minimum block number
 *       - in: query
 *         name: endBlock
 *         schema:
 *           type: integer
 *         description: Filter by maximum block number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TransferEvent'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       400:
 *         description: Bad request - Missing required filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      from,
      to,
      startBlock,
      endBlock,
      page = '1',
      pageSize = '100'
    } = req.query as Record<string, string>;

    const result = await getTransferEvents(
      pool,
      {
        from,
        to,
        startBlock: startBlock ? parseInt(startBlock) : undefined,
        endBlock: endBlock ? parseInt(endBlock) : undefined,
      },
      {
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    );

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error fetching transfer events:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
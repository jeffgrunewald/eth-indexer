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
 *     summary: Get transfer events
 *     description: Retrieve paginated transfer events with optional filtering
 *     parameters:
 *       - name: from
 *         in: query
 *         description: Filter by sender address
 *         required: false
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         description: Filter by recipient address
 *         required: false
 *         schema:
 *           type: string
 *       - name: startBlock
 *         in: query
 *         description: Filter by minimum block number
 *         required: false
 *         schema:
 *           type: integer
 *       - name: endBlock
 *         in: query
 *         description: Filter by maximum block number
 *         required: false
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         description: Page number (default: 1)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: Number of items per page (default: 100)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Successful response
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
 *                   $ref: '#/components/schemas/Pagination'
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

    // Validate that at least one address filter is provided
    if (!from && !to) {
      return res.status(400).json({
        error: 'At least one of "from" or "to" parameters must be provided'
      });
    }

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
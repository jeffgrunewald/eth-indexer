import { Pool } from 'pg';
import {
  IndexedTransferEvent,
  TransferStats,
  PaginationParams,
  EventQueryParams,
  PaginatedResponse,
  TransferEvent
} from '../types';

export async function insertTransferEvent(
  pool: Pool,
  event: TransferEvent
): Promise<void> {
  await pool.query(
    `INSERT INTO transfer_events (from_address, to_address, value, transaction_hash, block_number, timestamp, created_at)
     VALUES ($1, $2, $3, $4, $5, to_timestamp($6), NOW())
     ON CONFLICT (transaction_hash) DO NOTHING`,
    [
      event.from,
      event.to,
      event.value,
      event.transactionHash,
      event.blockNumber,
      event.timestamp
    ]
  );
}

export async function getTransferEvents(
  pool: Pool,
  queryParams: EventQueryParams,
  paginationParams: PaginationParams
): Promise<PaginatedResponse<IndexedTransferEvent>> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramCount = 1;

  if (queryParams.from) {
    conditions.push(`from_address = $${paramCount}`);
    params.push(queryParams.from);
    paramCount++;
  }

  if (queryParams.to) {
    conditions.push(`to_address = $${paramCount}`);
    params.push(queryParams.to);
    paramCount++;
  }

  // If no specific filters are set, use 100th latest block as default start
  if (!queryParams.from && !queryParams.to && !queryParams.startBlock) {
    const defaultStartBlock = await get100thLatestSavedBlock(pool) || 0;
    conditions.push(`block_number >= $${paramCount}`);
    params.push(defaultStartBlock);
    paramCount++;
  } else if (queryParams.startBlock) {
    conditions.push(`block_number >= $${paramCount}`);
    params.push(queryParams.startBlock);
    paramCount++;
  }

  if (queryParams.endBlock) {
    conditions.push(`block_number <= $${paramCount}`);
    params.push(queryParams.endBlock);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Add pagination parameters
  params.push(paginationParams.pageSize);
  params.push((paginationParams.page - 1) * paginationParams.pageSize);

  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM transfer_events ${whereClause}`,
    params.slice(0, -2)
  );
  
  const total = parseInt(countResult.rows[0].total);

  const result = await pool.query<IndexedTransferEvent>(`
    SELECT 
      from_address AS "from",
      to_address AS "to",
      block_number AS "blockNumber",
      transaction_hash AS "transactionHash",
      value,
      timestamp,
      created_at AS "createdAt"
    FROM transfer_events
    ${whereClause}
    ORDER BY "blockNumber" DESC, "transactionHash"
    LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    params
  );

  return {
    data: result.rows,
    pagination: {
      currentPage: paginationParams.page,
      pageSize: paginationParams.pageSize,
      totalPages: Math.ceil(total / paginationParams.pageSize),
      totalItems: total
    }
  };
}

export async function getTransferStats(pool: Pool): Promise<TransferStats> {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total_events,
      SUM(value)::TEXT as total_transferred,
      MAX(created_at) as last_event_at
    FROM transfer_events
  `);

  const stats = result.rows[0];
  return {
    totalEvents: parseInt(stats.total_events),
    totalTransferred: stats.total_transferred,
    lastEventAt: stats.last_event_at
  };
}

export async function getLatestSavedBlock(pool: Pool): Promise<number | null> {
  const result = await pool.query<{ latest_block: string }>(`
    SELECT MAX(block_number) AS latest_block
    FROM transfer_events
  `);
  
  return result.rows[0].latest_block ? Number(result.rows[0].latest_block) : null;
}

export async function get100thLatestSavedBlock(pool: Pool): Promise<number | null> {
  const result = await pool.query<{ block_number: string }>(`
    SELECT block_number
    FROM transfer_events
    GROUP BY block_number
    ORDER BY block_number DESC
    OFFSET 99
    LIMIT 1
  `);

  return result.rows[0]?.block_number ? Number(result.rows[0].block_number) : null;
} 
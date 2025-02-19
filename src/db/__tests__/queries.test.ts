import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {
  insertTransferEvent,
  getTransferEvents,
  getTransferStats,
  getLatestSavedBlock
} from '../queries';
import { TransferEvent } from '../../types';
import { createSampleEvents } from '../../test/utils';

dotenv.config();

describe('Database Queries', () => {
  let pool: Pool;

  beforeAll(async () => {
    // Connect to eth-indexer database
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Run schema migration
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../../../db/schema.sql'),
      'utf8'
    );
    await pool.query(schemaSQL);

    // Clear the table before tests
    await pool.query('TRUNCATE transfer_events');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should insert and retrieve transfer events', async () => {
    const sampleEvents = createSampleEvents(12);

    // Insert all events
    for (const event of sampleEvents) {
      await insertTransferEvent(pool, event);
    }

    // Test pagination
    const page1 = await getTransferEvents(pool, {}, { page: 1, pageSize: 5 });
    expect(page1.data.length).toBe(5);
    expect(page1.pagination.totalItems).toBe(12);
    expect(page1.pagination.totalPages).toBe(3);

    // Test filtering by address
    const fromEvents = await getTransferEvents(
      pool,
      { from: sampleEvents[0].from },
      { page: 1, pageSize: 10 }
    );
    expect(fromEvents.data.length).toBe(1);
    expect(fromEvents.data[0].from).toBe(sampleEvents[0].from);

    // Test filtering by block range
    const blockRangeEvents = await getTransferEvents(
      pool,
      {
        startBlock: 1000002,
        endBlock: 1000005
      },
      { page: 1, pageSize: 10 }
    );
    expect(blockRangeEvents.data.length).toBe(4);
    expect(Number(blockRangeEvents.data[0].blockNumber)).toBeGreaterThanOrEqual(1000002);
    expect(Number(blockRangeEvents.data[0].blockNumber)).toBeLessThanOrEqual(1000005);
  });

  it('should retrieve correct transfer stats', async () => {
    const stats = await getTransferStats(pool);
    
    expect(stats.totalEvents).toBe(12);
    expect(typeof stats.totalTransferred).toBe('string');
    expect(stats.totalTransferred).toBe("780000000")
    expect(stats.lastEventAt).toBeInstanceOf(Date);
  });

  it('should get latest saved block', async () => {
    const latestBlock = await getLatestSavedBlock(pool);
    
    expect(typeof latestBlock).toBe('number');
    expect(latestBlock).toBe(1000011); // Should be the highest block number from sample data
  });
}); 
import { createMocks } from 'node-mocks-http';
import { Pool } from 'pg';
import eventsHandler from '../../src/pages/api/events';
import statsHandler from '../../src/pages/api/stats';
import { insertTransferEvent } from '../../src/db/queries';
import { TransferEvent } from '../../src/types';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createSampleEvents } from '../utils/testHelpers';

dotenv.config();

describe('API Endpoints', () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Run schema migration
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../../db/schema.sql'),
      'utf8'
    );
    await pool.query(schemaSQL);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE transfer_events');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/events', () => {
    it('should return paginated events', async () => {
      const sampleEvents = createSampleEvents(5);

      for (const event of sampleEvents) {
        await insertTransferEvent(pool, event);
      }

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          from: sampleEvents[0].from,
          page: '1',
          pageSize: '3'
        }
      });

      await eventsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const jsonResponse = JSON.parse(res._getData());
      expect(jsonResponse.data.length).toBe(1);
      expect(jsonResponse.pagination.totalItems).toBe(1);
      expect(jsonResponse.pagination.totalPages).toBe(1);
    });

    it('should filter events by address', async () => {
      // Insert sample event
      const event: TransferEvent = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: BigInt(1000000),
        transactionHash: '0x123',
        blockNumber: 1000000,
        timestamp: Math.floor(Date.now() / 1000)
      };
      await insertTransferEvent(pool, event);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          from: event.from
        }
      });

      await eventsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const jsonResponse = JSON.parse(res._getData());
      expect(jsonResponse.data.length).toBe(1);
      expect(jsonResponse.data[0].from).toBe(event.from);
    });
  });

  describe('GET /api/stats', () => {
    it('should return transfer statistics', async () => {
      const events = createSampleEvents(3);

      for (const event of events) {
        await insertTransferEvent(pool, event);
      }

      const { req, res } = createMocks({
        method: 'GET'
      });

      await statsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const stats = JSON.parse(res._getData());
      expect(stats.totalEvents).toBe(3);
      expect(stats.totalTransferred).toBe("60000000");
      expect(new Date(stats.lastEventAt)).toBeInstanceOf(Date);
    });
  });
}); 
import { createServer } from 'http'
import fs from 'fs';
import { parse } from 'url'
import next from 'next'
import path from 'path';
import { Pool } from 'pg';
import { TransferEventListener } from './services/transferEventListener'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = Number(process.env.PORT) || 3000

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

async function main() {
  try {
    // Ensure the database is setup; migration is idempotent
    await setup_db()

    // Initialize Next.js
    await app.prepare()

    const listener = new TransferEventListener()

    // Create server
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('SIGINT signal received. Stopping server...')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received. Killing server...')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })

    server.listen(port, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? 'development' : process.env.NODE_ENV
        }`
      )
    })

    // Start the event listener
    await listener.start()
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

async function setup_db() {
  const maxRetries = 10;
  const retryDelay = 1000; // 1 second
  let retries = 0;

  // Simple mechanism give the database a moment to initialize;
  // This should be back off exponentially in a production setting and possibly
  // fail the app over to a reduced/degraded operational state.
  while (retries < maxRetries) {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      // Test connection
      await pool.query('SELECT 1');

      // Run schema migration
      const schemaSQL = fs.readFileSync(
        path.join(__dirname, '../db/schema.sql'),
        'utf8'
      );
      await pool.query(schemaSQL);

      await pool.end();
      return;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error}`);
      }
      console.log(`Database connection attempt ${retries} failed, retrying in 1 second...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

main()
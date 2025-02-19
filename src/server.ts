import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { TransferEventListener } from './services/transferEventListener'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

async function main() {
  try {
    // Initialize Next.js
    await app.prepare()

    // Start the event listener
    const listener = new TransferEventListener()
    await listener.start()

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
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received. Closing server...')
      await listener.stop()
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
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

main() 
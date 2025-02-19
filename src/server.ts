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

main() 
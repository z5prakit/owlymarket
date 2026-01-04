/**
 * Standalone API server for Railway deployment
 * This runs only the API routes without Next.js frontend
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl

      // Only handle API routes
      if (pathname.startsWith('/api/')) {
        await handle(req, res, parsedUrl)
      } else {
        // Redirect all non-API requests to frontend
        res.writeHead(302, {
          'Location': 'https://www.owlymarket.xyz' + pathname
        })
        res.end()
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> API server ready on http://${hostname}:${port}`)
      console.log(`> Environment: ${process.env.NODE_ENV}`)
      console.log(`> Only /api/* routes are handled`)
    })
})

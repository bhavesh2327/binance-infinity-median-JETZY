require('dotenv').config()
const { app, server } = require('./config/httpServer')

const PORT = process.env.PORT || 3000;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`)
    process.exit(1)
  }
  console.error('Server error:', err)
  process.exit(1)
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

import os from 'os'
import app from './app'
import logger from './libs/logger'
import InitService from './service/init'

const { PORT = 3600 } = process.env

process.env.HOSTNAME = os.hostname()

app.listen(PORT, '0.0.0.0', async () => {
  logger.d(null, `Listening on port ${PORT} -> PID: ${process.pid}`)
  await InitService.init()
})

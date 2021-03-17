
/**
 * standalone server file, no cli
 */

import app from './app'

const {
  RINGCENTRAL_PORT: port,
  RINGCENTRAL_HOST: host,
  APP_HOME = '/'
} = process.env

app.listen(port, host, () => {
  console.log(`-> server running at: http://${host}:${port}${APP_HOME}`)
})

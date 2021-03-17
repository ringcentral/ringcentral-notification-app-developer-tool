
import Express from 'express'
import morgan from 'morgan'
import { resolve } from 'path'

const app = new Express()
app.use(morgan('tiny'))
const staticPath = resolve(process.cwd(), 'docs')
app.use(Express.static(staticPath))

const {
  RINGCENTRAL_PORT: port,
  RINGCENTRAL_HOST: host,
  APP_HOME = '/'
} = process.env

app.listen(port, host, () => {
  console.log(`-> server running at: http://${host}:${port}${APP_HOME}`)
})

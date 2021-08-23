
const copy = require('json-deep-copy').default
const {
  RINGCENTRAL_APP_SERVER_GH,
  RINGCENTRAL_CLIENT_ID,
  RINGCENTRAL_SERVER,
  RINGCENTRAL_REDIRECT_GH
} = process.env

const { resolve } = require('path')
const cwd = process.cwd()
const pack = require(resolve(cwd, 'package.json'))

const data = {
  version: pack.version,
  description: pack.description,
  title: pack.name,
  server: RINGCENTRAL_APP_SERVER_GH,
  cdn: RINGCENTRAL_APP_SERVER_GH,
  clientId: RINGCENTRAL_CLIENT_ID,
  rcServer: RINGCENTRAL_SERVER,
  redirect: RINGCENTRAL_REDIRECT_GH
}

function create (view) {
  const d = copy(data)
  d.view = view
  d._global = copy(d)
  return {
    loader: 'pug-html-loader',
    options: {
      data: d
    }
  }
}

exports.pugIndex = create('index')
exports.authIndex = create('auth')

/**
 * handle events
 */

function postMessage (data) {
  window.postMessage(data, '*')
}

export function getCode () {
  const key = 'rc-authcode'
  const c = window.localStorage.getItem(key)
  if (c) {
    window.localStorage.setItem(key, '')
    return c
  } else {
    return ''
  }
}

export function login (msg = postMessage) {
  const c = getCode()
  if (c) {
    msg({
      type: 'rc-adapter-authorization-code',
      callbackUri: `${window.rc.callbackUri}?code=${c}`
    })
  }
}

export function getUrl () {
  return window.rc.authUrlDefaultRc.replace(
    window.rc.defaultState,
    window.rc.view
  )
}

function onEvent (e) {
  const { data } = e
  console.debug('got data from ev', data)
  if (data) {
    switch (data.type) {
      case 'rc-login-popup-notify':
        // get login oAuthUri from widget
        console.log('rc-login-popup-notify:', data.oAuthUri)
        window.location.href = getUrl()
        //  window.open(data.oAuthUri); // open oauth uri to login
        break
      case 'rc-adapter-pushAdapterState':
        setTimeout(login, 100)
        break
      default:
        break
    }
  }
}

export function handleEvent () {
  window.rc = JSON.parse(
    window.localStorage.getItem('rc-data-ref', JSON.stringify(window.rc))
  )
  // window.top = window
  // window.parent = window
  window.addEventListener('message', onEvent)
}

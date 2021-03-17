
export function checkPermission () {
  // First check whether we already have permission to access the microphone.
  cordova.plugins.iosrtc.registerGlobals()
  Object.defineProperty(navigator, 'userAgent', {
    get: function () { return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari' }
  })
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevicesOriginal = navigator.mediaDevices.enumerateDevices
    navigator.mediaDevices.enumerateDevices = () => {
      const keys = [
        'deviceId',
        'facing',
        'groupId',
        'id',
        'kind',
        'label'
      ]
      return navigator
        .mediaDevices
        .enumerateDevicesOriginal()
        .then(arr => {
          return arr.map(d => {
            return keys.reduce((p, k) => {
              return {
                ...p,
                [k]: d[k] || ''
              }
            }, {})
          })
        })
    }
  }

  window.audioinput.checkMicrophonePermission((hasPermission) => {
    if (hasPermission) {
      console.log('We already have permission to record.')
      // startCapture()
    } else {
      // Ask the user for permission to access the microphone
      window.audioinput.getMicrophonePermission((hasPermission, message) => {
        if (hasPermission) {
          console.log('User granted us permission to record.')
        } else {
          console.warn('User denied permission to record.')
        }
      })
    }
  })
}

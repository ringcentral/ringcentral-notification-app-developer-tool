/**
 * since ios safari can not get audio output device by navigator.mediaDevices.enumerateDevices()
 so audioElem.setSinkId would not work, let's disable setSinkId
 */

export default () => {
  HTMLMediaElement.prototype.setSinkId = function (id) {
    console.log('running HTMLMediaElement.prototype.setSinkId, set to:', id)
  }
}

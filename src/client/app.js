/**
 * entry file for install page
 */

import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/index/index.jsx'
import './css/index.styl'

const renderReactDom = () => {
  ReactDOM.render(<App />, document.getElementById('container'))
}

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    renderReactDom()
  }, false)
} else {
  renderReactDom()
}

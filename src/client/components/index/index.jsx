import { useState, useRef } from 'react'
import qs from 'query-string'
import { Form, Input, Button } from 'antd'
import { PostMessageManager } from 'rc-postmessage'

const FormItem = Form.Item
const postMessage = new PostMessageManager({
  debug: true
})
const MESSAGE_CHANNEL = {
  oauth: 'INTEGRATION_OAUTH_CHANNEL',
  submitted: 'INTEGRATION_SUBMIT_CHANNEL',
  init: 'get-host-origin'
}

function getQuery () {
  return qs.parse(window.location.search)
}

function buildAppUrl (q) {
  return `${q.appUrl}?webhook=${encodeURIComponent(q.webhook)}&frameName=${encodeURIComponent(q.frameName)}`
}

function getOrigin (url) {
  const arr = url.split('/')
  return arr[0] + '//' + arr[2]
}

const q = getQuery()

export default function App () {
  const [form] = Form.useForm()
  const control = useRef(null)
  const [state, setter] = useState({
    frameName: q.frameName || 'my-app',
    webhook: q.webhook,
    appUrl: q.appUrl || 'about:blank',
    canSubmit: false
  })

  function setState (ext) {
    setter(old => {
      const up = {
        ...old,
        ...ext
      }
      if ('appUrl' in ext) {
        updateUrl(up)
      }
      return up
    })
  }

  function updateUrl (q) {
    const url = `${window.rc.cdn}?frameName=${q.frameName}&webhook=${q.webhook}&appUrl=${q.appUrl}`
    window.history.pushState({
      url
    }, '', url)
  }

  async function submit () {
    setState({
      canSubmit: false
    })
    const now = +new Date()
    const x = await control.current.invoke(MESSAGE_CHANNEL.submitted)
      .catch(console.error)
    const now1 = +new Date()
    console.log('time used', now1 - now)
    console.log('submit result', x)
    setState({
      canSubmit: true
    })
  }

  function handleFinish (res) {
    setState(res)
  }

  function initIframeEvents () {
    control.current = postMessage.create({
      contentWindow: document.getElementById('iframe').contentWindow,
      targetOrigin: getOrigin(state.appUrl)
    })
    control.current.on(MESSAGE_CHANNEL.oauth, (data, ...args) => {
      console.log('data', data, ...args)
      setState({
        canSubmit: data.status
      })
    })
  }

  const iframeSrc = buildAppUrl(state)
  return (
    <div className='wrap'>
      <h1>RingCentral notification app developer tool</h1>
      <div className='iframe-wrap'>
        <iframe
          src={iframeSrc}
          id='iframe'
          onLoad={initIframeEvents}
        />
        <div className='pd1y control'>
          <Button
            disabled={!state.canSubmit}
            onClick={submit}
            type='primary'
          >
            Submit
          </Button>
        </div>
      </div>
      <div className='pd1y'>
        <h3>Settings</h3>
        <Form
          form={form}
          name='app-form'
          onFinish={handleFinish}
          initialValues={state}
        >
          <FormItem
            label='App Url'
            key='appUrl'
            rules={[{
              max: 1300, message: '130 chars max'
            }]}
            name='appUrl'
          >
            <Input placeholder='https://' />
          </FormItem>
          <FormItem
            label='Frame Name'
            key='frameName'
            rules={[{
              max: 130, message: '130 chars max'
            }]}
            name='frameName'
          >
            <Input placeholder='myApp' />
          </FormItem>
          <FormItem
            label='Webhook Url'
            key='Webhook'
            rules={[{
              max: 1300, message: '130 chars max'
            }]}
            name='webhook'
          >
            <Input placeholder='https://' />
          </FormItem>
          <FormItem
            noStyle
          >
            <Button
              type='primary'
              htmlType='submit'
            >
              Apply
            </Button>
          </FormItem>
        </Form>
      </div>
    </div>
  )
}

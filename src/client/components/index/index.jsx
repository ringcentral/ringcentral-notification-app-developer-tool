import { useState, useRef, useEffect } from 'react'
import qs from 'query-string'
import { Form, Input, Button, Tooltip } from 'antd'
import { PostMessageManager } from 'rc-postmessage'
import Auth from './login'
import { QuestionCircleOutlined, GithubFilled } from '@ant-design/icons'

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
  function setWebhook (uri) {
    form.setFieldsValue({
      webhook: uri
    })
  }

  function initIframeEvents () {
    control.current = postMessage.create({
      contentWindow: document.getElementById('iframe').contentWindow,
      timeout: 100000,
      targetOrigin: getOrigin(state.appUrl)
    })
    control.current.on(MESSAGE_CHANNEL.oauth, (data, ...args) => {
      console.log('data', data, ...args)
      setState({
        canSubmit: data.status
      })
    })
  }

  useEffect(() => {
    setTimeout(() => {
      window.particleBg('#pbg', {
        color: '#777'
      })
    }, 100)
  }, [])

  const iframeSrc = buildAppUrl(state)
  const after = (
    <Tooltip title='You can goto RingCentral app -> Apps -> Incoming Webhook to get a test webhook url or use the "Get webhook url" button'>
      <QuestionCircleOutlined />
    </Tooltip>
  )
  return (
    <div className='wrap'>
      <h2>
        RingCentral add-in developer tool
        <a
          href='https://github.com/ringcentral/ringcentral-notification-app-developer-tool'
          target='_blank'
          rel='noreferrer'
          className='mg1l'
        >
          <GithubFilled />
        </a>
      </h2>
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
      <div className='pd2y setting-box'>
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
            <Input
              placeholder='https://'
              addonAfter={after}
            />

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
            <Auth setWebhook={setWebhook} />
          </FormItem>
        </Form>
      </div>
      <div className='pd2y'>
        <h3>About</h3>
        <p>This app will simulate RingCentral add-in running in RingCentral App</p>
      </div>
      <div className='pd2y'>
        <h3>Links</h3>
        <ul>
          <li>
            <a href='https://github.com/ringcentral/ringcentral-add-in-framework-js' target='_blank' rel='noreferrer'>ringcentral-add-in-framework-js</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

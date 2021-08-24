import { useEffect } from 'react'
import { Form, Input, Button, Modal } from 'antd'

const FormItem = Form.Item

export default function Setting (props) {
  const [form] = Form.useForm()
  function handleFinish (res) {
    props.onSubmit(res)
  }
  function reset () {
    form.resetFields()
  }
  useEffect(() => {
    reset()
  }, [props.setting])
  const rps = {
    title: 'Custom setting',
    visible: props.visible,
    footer: null,
    onCancel: () => null,
    closable: false
  }
  return (
    <Modal {...rps}>
      <Form
        form={form}
        name='setting-form'
        onFinish={handleFinish}
        initialValues={props.setting}
      >
        <FormItem
          label=' API Server url'
          key='server'
          rules={[{
            max: 400, message: '400 chars max'
          }, {
            required: true
          }]}
          name='server'
        >
          <Input placeholder='https://' />
        </FormItem>
        <FormItem
          label='Client ID'
          key='frameName'
          rules={[{
            required: true
          }, {
            max: 130, message: '130 chars max'
          }]}
          name='clientId'
        >
          <Input placeholder='client ID' />
        </FormItem>
        <FormItem
          noStyle
        >
          <Button
            type='primary'
            htmlType='submit'
          >
            Submit
          </Button>
          <Button
            className='mg1l'
            onClick={props.handleCancel}
          >
            Cancel
          </Button>
          <Button
            className='mg1l'
            onClick={props.handleReset}
          >
            Reset
          </Button>
          <p className='mg1t'>* You can get your app's client ID and api server in your app's setting and credential pages</p>
          <p>* Make sure you add <b>https://ringcentral.github.io/ringcentral-notification-app-developer-tool/auth.html</b> as one of your app's Callback Url</p>
        </FormItem>
      </Form>
    </Modal>
  )
}

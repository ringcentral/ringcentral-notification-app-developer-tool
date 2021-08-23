import { Component } from 'react'
import { Button, Tooltip, notification, Modal, Select } from 'antd'
import copy from 'json-deep-copy'
import { SettingOutlined } from '@ant-design/icons'
import Setting from './setting'

const lsKey = 'rc-platform'
const lsSettingKey = 'rc-d-setting'
const {
  Option
} = Select

export default class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      logined: false,
      teams: [],
      showTeamSelect: false,
      showSetting: false,
      ...this.getLSsetting()
    }
  }

  componentDidMount () {
    this.init()
  }

  createSDK = () => {
    return new window.RingCentral.SDK({
      server: this.state.server,
      clientId: this.state.clientId,
      // clientSecret: 'yourClientSecret',
      redirectUri: window.rc.redirect // optional, but is required for Implicit Grant and Authorization Code OAuth Flows (see below)
    })
  }

  init = async () => {
    this.sdk = this.createSDK()
    const logined = await this.checkLogin()
    this.setState({
      logined
    })
  }

  defaultSetting = {
    server: window.rc.rcServer,
    clientId: window.rc.clientId
  }

  getLSsetting = () => {
    const def = copy(this.defaultSetting)
    const settings = window.localStorage.getItem(lsSettingKey)
    if (!settings) {
      return def
    }
    try {
      return Object.assign({}, def, JSON.parse(settings))
    } catch (e) {
      console.log('parse setting err', e)
      return def
    }
  }

  cancelSetting = () => {
    this.setState({
      showSetting: false
    })
  }

  resetSetting = () => {
    window.localStorage.setItem(lsSettingKey, JSON.stringify(this.defaultSetting))
    this.setState(
      copy(this.defaultSetting), this.updateSDK
    )
  }

  submitSetting = res => {
    window.localStorage.setItem(lsSettingKey, JSON.stringify(res))
    this.setState({
      ...res,
      showSetting: false
    }, this.updateSDK)
  }

  updateSDK = () => {
    window.localStorage.removeItem(lsKey)
    this.sdk = this.createSDK()
    this.setState({
      logined: false
    })
  }

  handleOpenSetting = () => {
    this.setState({
      showSetting: true
    })
  }

  checkLogin = () => {
    let token = window.localStorage.getItem(lsKey)
    if (!token) {
      return false
    }
    try {
      token = JSON.parse(token)
    } catch (e) {
      console.error('token parse failed', token)
      return false
    }
    this.sdk.platform().auth().setData(token)
    return this.sdk.platform().auth().accessTokenValid()
  }

  login = () => {
    const loginUrl = this.sdk.loginUrl()
    this.sdk
      .loginWindow({ url: loginUrl })
      .then((loginOptions) => {
        return this.sdk.login(loginOptions)
      })
      .then(this.afterLogin)
      .catch(this.loginError)
  }

  loginError = err => {
    this.setState({
      loading: false
    })
    console.error(err)
    notification.error({
      title: 'login failed',
      description: err.message
    })
  }

  afterLogin = () => {
    this.setState({
      logined: true
    })
    this.openTeamSelect()
  }

  handleLogout = () => {
    this.sdk.logout().then(() => {
      this.setState({
        logined: false
      })
    })
  }

  getTeams = () => {
    return this.sdk
      .send({
        method: 'GET',
        url: '/restapi/v1.0/glip/groups',
        query: { type: 'Team', recordCount: 250 }
      })
      .then(function (apiResponse) {
        return apiResponse.json()
      })
      .then(function (json) {
        return json.records
      })
      .catch(function (e) {
        if (e.response || e.request) {
          const request = e.request
          const response = e.response
          console.log('API error ' + e.message + ' for URL' + request.url + ' ' + this.sdk.error(response))
        }
        this.setState({
          loading: false
        })
        notification.error({
          title: 'fetch teams data failed',
          description: e.message
        })
      })
  }

  handleSelect = async id => {
    this.setState({
      showTeamSelect: false
    })
    const url = `/restapi/v1.0/glip/groups/${id}/webhooks`
    const uri = await this.sdk
      .send({
        method: 'POST',
        url
      })
      .then(function (apiResponse) {
        return apiResponse.json()
      })
      .then(function (json) {
        return json.uri
      })
      .catch(function (e) {
        if (e.response || e.request) {
          const request = e.request
          const response = e.response
          console.log('API error ' + e.message + ' for URL' + request.url + ' ' + this.sdk.error(response))
        }
        this.setState({
          loading: false
        })
        notification.error({
          title: 'create webhook uri failed',
          description: e.message
        })
      })
    if (!uri) {
      return false
    }
    this.setState({
      loading: false
    })
    this.props.setWebhook(uri)
  }

  openTeamSelect = async () => {
    const teams = await this.getTeams()
    console.log('teams', teams)
    if (!teams) {
      return false
    }
    this.setState({
      teams,
      showTeamSelect: true
    })
  }

  handleClick = async () => {
    this.setState({
      loading: true
    })
    const logined = await this.checkLogin()
    if (!logined) {
      this.login()
    } else {
      this.openTeamSelect()
    }
  }

  renderModal () {
    const oprops = {
      visible: this.state.showTeamSelect,
      footer: null,
      onCancel: () => null,
      closable: false
    }
    const sprops = {
      className: 'team-select',
      placeholder: 'Please select a team',
      onSelect: this.handleSelect,
      showSearch: true,
      optionFilterProp: 'children',
      filterOption: (input, option) => {
        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    }
    return (
      <Modal
        {...oprops}
      >
        <Select
          {...sprops}
        >
          {
            this.state.teams.map(t => {
              return (
                <Option value={t.id} key={t.id}>
                  {t.name}
                </Option>
              )
            })
          }
        </Select>
      </Modal>
    )
  }

  renderLogout () {
    if (!this.state.logined) {
      return null
    }
    return (
      <span
        className='common-link mg3l'
        onClick={this.handleLogout}
      >
        Logout
      </span>
    )
  }

  renderSetting () {
    const props = {
      setting: {
        clientId: this.state.clientId,
        server: this.state.server
      },
      handleCancel: this.cancelSetting,
      handleReset: this.resetSetting,
      onSubmit: this.submitSetting,
      visible: this.state.showSetting
    }
    return (
      <span>
        <SettingOutlined
          className='common-link mg1l'
          onClick={this.handleOpenSetting}
        />
        <Setting
          {...props}
        />
      </span>
    )
  }

  render () {
    return (
      <span className='mg1l'>
        <Tooltip title='After login you can select team and get a webhook url that can be used to test webhook'>
          <Button
            onClick={this.handleClick}
            className='mg1l'
            loading={this.state.loading}
          >
            Get a webhookUrl
          </Button>
        </Tooltip>
        {this.renderSetting()}
        {this.renderLogout()}
        {this.renderModal()}
      </span>
    )
  }
}

import { Component } from 'react'
import { Button, Tooltip, notification, Modal, Select } from 'antd'
const { SDK } = window.RingCentral

const sdk = new SDK({
  server: window.rc.rcServer,
  clientId: window.rc.clientId,
  // clientSecret: 'yourClientSecret',
  redirectUri: window.rc.redirect // optional, but is required for Implicit Grant and Authorization Code OAuth Flows (see below)
})
const lsKey = 'rc-platform'
const {
  Option
} = Select

export default class Login extends Component {
  state = {
    loading: false,
    logined: false,
    teams: [],
    showTeamSelect: false
  }

  componentDidMount () {
    this.init()
  }

  init = async () => {
    const logined = await this.checkLogin()
    this.setState({
      logined
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
    sdk.platform().auth().setData(token)
    return sdk.platform().auth().accessTokenValid()
  }

  login = () => {
    const loginUrl = sdk.loginUrl()
    sdk
      .loginWindow({ url: loginUrl })
      .then((loginOptions) => {
        return sdk.login(loginOptions)
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
    sdk.logout().then(() => {
      this.setState({
        logined: false
      })
    })
  }

  getTeams = () => {
    return sdk
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
          console.log('API error ' + e.message + ' for URL' + request.url + ' ' + sdk.error(response))
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
    const uri = await sdk
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
          console.log('API error ' + e.message + ' for URL' + request.url + ' ' + sdk.error(response))
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
        className='pointer mg1l'
        onClick={this.handleLogout}
      >
        Logout
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
        {this.renderLogout()}
        {this.renderModal()}
      </span>
    )
  }
}

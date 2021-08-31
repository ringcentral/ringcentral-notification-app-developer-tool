import dat from './data.json'

export default async function test (sdk, id) {
  const r = await sdk.send({
    method: 'POST',
    url: `/restapi/v1.0/glip/chats/${id}/adaptive-cards`,
    body: {
      attachments: [dat]
    }
  })
    .then(function (apiResponse) {
      return apiResponse.json()
    })
    .then(function (json) {
      return json
    })
  console.log(r)
}

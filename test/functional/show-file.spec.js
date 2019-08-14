'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Create File')

const Helpers = use('Helpers')
const Factory = use('Factory')

const User = use('App/Models/User')
const File = use('App/Models/File')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await User.query().delete()
  await File.query().delete()
})

test('cannot show a file if id is not passed through the params', async ({
  client
}) => {
  const response = await client.get('files').end()
  response.assertStatus(404)
  response.assertText(
    'HttpException: E_ROUTE_NOT_FOUND: Route not found GET /files'
  )
})

test('can show a file', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  await client
    .post('files')
    .loginVia(user, 'jwt')
    .attach('file', Helpers.tmpPath('uploads/teste.png'))
    .end()

  const image = await File.findBy('name', 'teste.png')
  const response = await client.get(`files/${image.id}`).end()

  response.assertStatus(200)
  response.assertJSONSubset({})
})

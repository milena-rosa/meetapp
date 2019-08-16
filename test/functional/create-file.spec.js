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

test('cannot create a file if the user is not authenticated', async ({
  client
}) => {
  const data = await Factory.model('App/Models/File').make()

  const response = await client
    .post('files')
    .send(data)
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'E_INVALID_JWT_TOKEN: jwt must be provided',
      name: 'InvalidJwtToken'
    }
  })
})

test('cannot create a file if not an image or with a different extension of png or jpg', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .post('files')
    .loginVia(user, 'jwt')
    .attach('file', Helpers.tmpPath('uploads/teste.odt'))
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'Invalid file extension odt. Only png, jpg, jpeg are allowed',
      field: 'file',
      validation: 'fileExt'
    }
  ])
})

test('cannot create a file with more than 2MB', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const response = await client
    .post('files')
    .loginVia(user, 'jwt')
    .attach('file', Helpers.tmpPath('uploads/teste.jpeg'))
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'File size should be less than 2MB',
      field: 'file',
      validation: 'fileSize'
    }
  ])
})

test('can create an image file with less than 2MB', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const response = await client
    .post('files')
    .loginVia(user, 'jwt')
    .attach('file', Helpers.tmpPath('uploads/teste.png'))
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    name: 'teste.png',
    type: 'image',
    subtype: 'png'
  })
})

test('user needs to send a file through Multipart Form', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const response = await client
    .post('files')
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'The file should be a valid file.',
      field: 'file',
      validation: 'file'
    }
  ])
})

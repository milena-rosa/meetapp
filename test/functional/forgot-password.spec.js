'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Forgot Password')

const Mail = use('Mail')
const Factory = use('Factory')

const User = use('App/Models/User')

trait('Test/ApiClient')

afterEach(async () => {
  await User.query().delete()
})

test('cannot create a token without an e-mail', async ({ client }) => {
  Mail.fake()
  const redirectUrl = 'http://www.meetapp.com.br/reset_password'

  const response = await client
    .post('passwords')
    .send({
      redirect_url: redirectUrl
    })
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'The email is required.',
      field: 'email',
      validation: 'required'
    }
  ])

  Mail.restore()
})

test('cannot create a token without a redirect_url', async ({ client }) => {
  Mail.fake()
  const user = Factory.model('App/Models/User').create()

  const response = await client
    .post('passwords')
    .send({
      email: user.email
    })
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'The redirect_url is required.',
      field: 'redirect_url',
      validation: 'required'
    }
  ])

  Mail.restore()
})

test('can create a token', async ({ client }) => {
  Mail.fake()

  const user = await Factory.model('App/Models/User').create()
  const redirectUrl = 'http://www.meetapp.com.br/reset_password'

  const response = await client
    .post('passwords')
    .send({
      email: user.email,
      redirect_url: redirectUrl
    })
    .end()

  response.assertStatus(204)

  Mail.restore()
})

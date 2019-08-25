'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Start Session')

const Factory = use('Factory')

const User = use('App/Models/User')

trait('Test/ApiClient')

afterEach(async () => {
  await User.query().delete()
})

test('can start a session with an email and a password', async ({ client }) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  await User.create({
    name,
    email,
    password
  })

  const response = await client
    .post('sessions')
    .send({
      email,
      password
    })
    .end()

  response.assertStatus(200)
})

test('cannot start a session without an email', async ({ client }) => {
  const response = await client
    .post('sessions')
    .send({
      password: '12345678'
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
})

test('cannot start a session without a password', async ({ client }) => {
  const response = await client
    .post('sessions')
    .send({
      email: 'teste@teste.com'
    })
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'The password is required.',
      field: 'password',
      validation: 'required'
    }
  ])
})

test('cannot start a session with an inexistent email', async ({ client }) => {
  const { email, password } = await Factory.model('App/Models/User').make()

  const response = await client
    .post('sessions')
    .send({
      email,
      password
    })
    .end()

  response.assertStatus(401)
  response.assertText(
    `E_USER_NOT_FOUND: Cannot find user with email as ${email}`
  )
})

test('cannot start a session with the wrong password', async ({ client }) => {
  const { email } = await Factory.model('App/Models/User').create()

  const response = await client
    .post('sessions')
    .send({
      email,
      password: '11111111'
    })
    .end()

  response.assertStatus(401)
  response.assertText(`E_PASSWORD_MISMATCH: Cannot verify user password`)
})

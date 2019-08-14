'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Reset Password')

const { subDays } = use('date-fns')
const Factory = use('Factory')

const User = use('App/Models/User')

trait('Test/ApiClient')

afterEach(async () => {
  await User.query().delete()
})

test('cannot restart the password without a token', async ({ client }) => {
  const response = await client
    .put('passwords')
    .send({
      password: '87654321',
      password_confirmation: '87654321'
    })
    .end()

  response.assertStatus(400)
  response.assertText(
    'Validation failed. Make sure you have filled all fields correctly'
  )
})

test('cannot restart the password with an expired token', async ({
  client
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()
  await User.create({
    name,
    email,
    password,
    token: '12345678910',
    token_created_at: subDays(new Date(), 5)
  })

  const response = await client
    .put('passwords')
    .send({
      token: '12345678910',
      password: '12345678',
      password_confirmation: '12345678'
    })
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: { message: 'The given token has already expired.' }
  })
})

test('can restart the password', async ({ client }) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()
  await User.create({
    name,
    email,
    password,
    token: '12345678910',
    token_created_at: new Date()
  })

  const response = await client
    .put('passwords')
    .send({
      token: '12345678910',
      password: '87654321',
      password_confirmation: '87654321'
    })
    .end()

  response.assertStatus(200)
})

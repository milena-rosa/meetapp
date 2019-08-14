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

test('cannot start a session without email/password', async ({ client }) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  await User.create({
    name,
    email,
    password
  })

  const response = await client.post('sessions').end()

  response.assertStatus(400)
  response.assertText(
    'Validation failed. Make sure you have filled all fields correctly'
  )
})

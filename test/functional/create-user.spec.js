'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Create User')

const Factory = use('Factory')
const User = use('App/Models/User')

trait('Test/ApiClient')

afterEach(async () => {
  await User.query().delete()
})

test('can create an user with valid name, e-mail and password', async ({
  client,
  assert
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()
  const response = await client
    .post('users')
    .send({ name, email, password, password_confirmation: '12345678' })
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({ name, email })

  const user = await User.findBy('email', email)
  assert.equal(user.toJSON().email, email)
})

test('cannot create an user without name, e-mail or password', async ({
  client,
  assert
}) => {
  const response = await client.post('users').end()

  response.assertStatus(400)

  const user = await User.find(1)
  assert.isNull(user)
})

test('cannot create an e-mail already registered', async ({
  client,
  assert
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  await client
    .post('users')
    .send({ name, email, password, password_confirmation: '12345678' })
    .end()
  const response = await client
    .post('users')
    .send({ name, email, password, password_confirmation: '12345678' })
    .end()

  response.assertStatus(400)
})

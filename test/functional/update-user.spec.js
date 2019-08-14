'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Update User')

const Factory = use('Factory')
const User = use('App/Models/User')

trait('Auth/Client')
trait('Test/ApiClient')

afterEach(async () => {
  await User.query().delete()
})

test('cannot update user data if the user is not authenticated', async ({
  client
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).create()

  const response = await client
    .put('users')
    .send({
      name,
      email,
      password
    })
    .end()

  response.assertStatus(401)
  response.assertText(
    'InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided'
  )
})

test('cannot update a user with an e-mail already registered', async ({
  client
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  const user = await User.create({
    name,
    email,
    password
  })

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({ email })
    .end()

  response.assertStatus(400)
})

test('cannot update user password if oldPassword is undefined', async ({
  client
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  const user = await User.create({ name, email, password })

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({
      password: '87654321',
      password_confirmation: '87654321'
    })
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: {
      message: 'You need to validate your password in order to update it.'
    }
  })
})

test('cannot update user password if oldPassword is wrong', async ({
  client
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  const user = await User.create({ name, email, password })

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({
      oldPassword: '',
      password: '87654321',
      password_confirmation: '87654321'
    })
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'Verify old password.'
    }
  })
})

test('can update user password if oldPassword is valid and password and password_confirmation matches', async ({
  client
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  const user = await User.create({ name, email, password })

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({
      oldPassword: '12345678',
      password: '87654321',
      password_confirmation: '87654321'
    })
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({})
})

test('cannot update user password if password and password_confirmation do not match', async ({
  client
}) => {
  const { name, email, password } = await Factory.model(
    'App/Models/User'
  ).make()

  const user = await User.create({ name, email, password })

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({
      oldPassword: '12345678',
      password: '87654321',
      password_confirmation: ''
    })
    .end()

  response.assertStatus(400)
  response.assertText(
    'Validation failed. Make sure you have filled all fields correctly'
  )
})

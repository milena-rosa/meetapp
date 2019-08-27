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
  response.assertJSONSubset({
    error: {
      message: 'E_INVALID_JWT_TOKEN: jwt must be provided',
      name: 'InvalidJwtToken'
    }
  })
})

test('cannot update a user with an e-mail already registered', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()
  const user2 = await Factory.model('App/Models/User').create()

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({ email: user2.email })
    .end()

  response.assertStatus(400)
})

test('cannot update user password if oldPassword is undefined', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({
      password: '87654321',
      password_confirmation: '87654321'
    })
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'Please, confirm your old password.'
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
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .put('users')
    .loginVia(user, 'jwt')
    .send({
      name: user.name,
      email: user.email,
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
  response.assertJSONSubset([
    {
      message: 'The password confirmation does not match.',
      field: 'password',
      validation: 'confirmed'
    }
  ])
})

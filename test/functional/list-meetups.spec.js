'use strict'

const { test, trait, afterEach } = use('Test/Suite')('List Meetups')

const { subDays } = require('date-fns')

const Factory = use('Factory')
const User = use('App/Models/User')
const Meetup = use('App/Models/Meetup')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await User.query().delete()
  await Meetup.query().delete()
})

test('cannot list meetups if not authenticated', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = { title, description, location, date }
  await Meetup.create({
    ...data,
    user_id: user.id
  })

  const response = await client.get('/meetups').end()

  response.assertStatus(401)
  response.assertText(
    'InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided'
  )
})

test('can list meetups organized by the logged user', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = { title, description, location, date }

  await Meetup.create({
    ...data,
    user_id: user.id
  })

  const response = await client
    .get('/meetups')
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    page: 1,
    data: [
      {
        title,
        description,
        location
      }
    ]
  })
})

test('can list meetups organized by the logged user passing a date through params', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()
  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = { title, description, location, date }

  await Meetup.create({
    ...data,
    user_id: user.id
  })

  // there's just a row in the table and the date is the factory created one.
  const response = await client
    .get('/meetups')
    .query({ date })
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    page: 1,
    data: [
      {
        title,
        description,
        location
      }
    ]
  })
})

test('can list meetups organized by the logged user passing a page through params', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()
  // create meetups
  await Factory.model('App/Models/Meetup').createMany(15)

  // there's just a row in the table and the date is the factory created one.
  const response = await client
    .get('/meetups')
    .query({ page: 2 })
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    page: 2
  })
})

test('cannot list meetups with past dates', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const { title, description, location } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = { title, description, location, date: subDays(new Date(), 5) }

  await Meetup.create({
    ...data,
    user_id: user.id
  })

  const response = await client
    .get('/meetups')
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({})
})

'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Cancel Meetup')

const { subDays } = require('date-fns')

const Factory = use('Factory')
const File = use('App/Models/File')
const User = use('App/Models/User')
const Meetup = use('App/Models/Meetup')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await File.query().delete()
  await User.query().delete()
  await Meetup.query().delete()
})

test('cannot cancel a meetup if the user is not authenticated', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const meetup = await Meetup.create({
    title,
    description,
    location,
    date,
    user_id: user.id
  })

  const response = await client.delete(`/meetups/${meetup.id}`).end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'E_INVALID_JWT_TOKEN: jwt must be provided',
      name: 'InvalidJwtToken'
    }
  })
})

test('cannot cancel a meetup of other user', async ({ client }) => {
  const users = await Factory.model('App/Models/User').createMany(2)

  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const meetup = await Meetup.create({
    title,
    description,
    location,
    date,
    user_id: users[0].id // create meetup with an user
  })

  const response = await client
    .delete(`/meetups/${meetup.id}`)
    .loginVia(users[1]) // login with the other user
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'You do not have permission to cancel this meetup.'
    }
  })
})

test('cannot cancel a meetup that has already passed', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, description, location } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const meetup = await Meetup.create({
    title,
    description,
    location,
    date: subDays(new Date(), 5),
    user_id: user.id
  })

  const response = await client
    .delete(`/meetups/${meetup.id}`)
    .loginVia(user)
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'You cannot cancel a meetup that has already passed.'
    }
  })
})

test('cannot cancel an inexistent meetup', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .delete('/meetups/1')
    .loginVia(user)
    .end()

  response.assertStatus(404)
  response.assertJSONSubset({
    error: { message: 'Something went wrong while cancelling the meetup.' }
  })
})

test('can cancel a meetup', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()
  const meetup = await Meetup.create({
    title,
    description,
    location,
    date,
    user_id: user.id
  })

  const response = await client
    .delete(`/meetups/${meetup.id}`)
    .loginVia(user)
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    message: 'ok'
  })
})

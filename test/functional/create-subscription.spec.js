'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Create Subscription')

const { subDays, addMinutes } = require('date-fns')

const Factory = use('Factory')
const User = use('App/Models/User')
const Meetup = use('App/Models/Meetup')
const Subscription = use('App/Models/Subscription')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await User.query().delete()
  await Meetup.query().delete()
})

test('cannot make a subscription if the user is not authenticated', async ({
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

  const response = await client.post(`subscriptions/${meetup.id}`).end()

  response.assertStatus(401)
  response.assertText(
    'InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided'
  )
})

test('cannot make a subscription if the meetup does not exist', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .post(`subscriptions/1`)
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: {
      message: 'Something went wrong while subscribing to the meetup.',
      err:
        'ModelNotFoundException: E_MISSING_DATABASE_ROW: Cannot find database row for Meetup model\n> More details: https://err.sh/adonisjs/errors/E_MISSING_DATABASE_ROW'
    }
  })
})

test('cannot subscribe to a meetup that the user him/herself organizes', async ({
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

  const response = await client
    .post(`subscriptions/${meetup.id}`)
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: { message: 'You cannot subscribe to a meetup you own.' }
  })
})

test('cannot subscribe to a meetup that has already passed', async ({
  client
}) => {
  const users = await Factory.model('App/Models/User').createMany(2)
  const { title, description, location } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const meetup = await Meetup.create({
    title,
    description,
    location,
    date: subDays(new Date(), 5),
    user_id: users[0].id // user 0 organizes the meetup
  })

  const response = await client
    .post(`subscriptions/${meetup.id}`)
    .loginVia(users[1], 'jwt') // user 1 is the logged one
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: {
      message: 'You cannot subscribe to a meetup that has already happened.'
    }
  })
})

test('cannot subscribe to a meetup that the user has already subscribed to', async ({
  client
}) => {
  const users = await Factory.model('App/Models/User').createMany(2)
  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const meetup = await Meetup.create({
    title,
    description,
    location,
    date,
    user_id: users[0].id // user 0 organizes the meetup
  })

  // make the first subscription
  await Subscription.create({
    meetup_id: meetup.id,
    user_id: users[1].id
  })

  const response = await client
    .post(`subscriptions/${meetup.id}`)
    .loginVia(users[1], 'jwt') // user 1 is the logged one
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: {
      message: 'You have already subscribed to this meetup.'
    }
  })
})

test('cannot subscribe to a meetup if subscribed to another event that will happen one hour before/after', async ({
  client
}) => {
  const users = await Factory.model('App/Models/User').createMany(2)
  const meetups = await Factory.model('App/Models/Meetup').makeMany(2)

  const subscribedMeetup = await Meetup.create({
    title: meetups[0].title,
    description: meetups[0].description,
    location: meetups[0].location,
    date: new Date(),
    user_id: users[0].id // user 0 organizes the meetup
  })

  const subscriptionToBeDone = await Meetup.create({
    title: meetups[1].title,
    description: meetups[1].description,
    location: meetups[1].location,
    date: addMinutes(new Date(), 30),
    user_id: users[0].id // user 0 organizes the meetup
  })

  // make the first subscription
  await Subscription.create({
    meetup_id: subscribedMeetup.id,
    user_id: users[1].id
  })

  const response = await client
    .post(`subscriptions/${subscriptionToBeDone.id}`)
    .loginVia(users[1], 'jwt') // user 1 is the logged one
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: {
      message: 'This meetup overlaps another meetup date/time.'
    }
  })
})

test('can subscribe to a meetup', async ({ client }) => {
  const users = await Factory.model('App/Models/User').createMany(2)
  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const meetup = await Meetup.create({
    title,
    description,
    location,
    date,
    user_id: users[0].id // user 0 organizes the meetup
  })

  const response = await client
    .post(`subscriptions/${meetup.id}`)
    .loginVia(users[1], 'jwt') // user 1 is the logged one
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    meetup_id: meetup.id,
    user_id: users[1].id
  })
})

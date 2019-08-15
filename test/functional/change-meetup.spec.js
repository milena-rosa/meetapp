'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Change Meetup')

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

test('cannot update a meetup if the user is not authenticated', async ({
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

  const response = await client.put(`/meetups/${meetup.id}`).end()

  response.assertStatus(401)
  response.assertText(
    'InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided'
  )
})

test('cannot update a meetup of other user', async ({ client }) => {
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
    .put(`/meetups/${meetup.id}`)
    .loginVia(users[1]) // login with the other user
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'You do not have permission to modify this meetup.'
    }
  })
})

test('cannot update the date of a meetup with a past value', async ({
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

  const newData = await Factory.model('App/Models/Meetup').create()

  const response = await client
    .put(`/meetups/${meetup.id}`)
    .loginVia(user)
    .send({ ...newData, date: subDays(new Date(), 5) })
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: {
      message:
        'You cannot update the meetup with a date/time that has already passed.'
    }
  })
})

test('cannot update a meetup that has already passed', async ({ client }) => {
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
    .put(`/meetups/${meetup.id}`)
    .loginVia(user)
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'You cannot modify a meetup that has already passed.'
    }
  })
})

test('cannot update an inexistent meetup', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .put('/meetups/1')
    .loginVia(user)
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    error: { message: 'Something went wrong while updating the meetup.' }
  })
})

test('can update a meetup', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const files = await Factory.model('App/Models/File').createMany(2)

  const meetups = await Factory.model('App/Models/Meetup').makeMany(2)
  const meetup = await Meetup.create({
    title: meetups[0].title,
    description: meetups[0].description,
    location: meetups[0].location,
    date: meetups[0].date,
    user_id: user.id,
    file_id: files[0].id
  })

  const response = await client
    .put(`/meetups/${meetup.id}`)
    .loginVia(user)
    .send({
      title: meetups[1].title,
      description: meetups[1].description,
      location: meetups[1].location,
      date: meetups[1].date,
      file_id: files[1].id
    })
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    title: meetups[1].title,
    description: meetups[1].description,
    location: meetups[1].location,
    date: meetups[1].date,
    file_id: files[1].id
  })
})

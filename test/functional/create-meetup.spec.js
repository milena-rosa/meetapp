'use strict'

const { format, subDays } = require('date-fns')

const { test, trait, afterEach } = use('Test/Suite')('Create Meetup')

const Factory = use('Factory')
const User = use('App/Models/User')
const Meetup = use('App/Models/Meetup')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await User.query().delete()
  await Meetup.query().delete()
})

test('can create a meetup if data is valid', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const response = await client
    .post('/meetups')
    .loginVia(user, 'jwt')
    .send({
      title,
      description,
      location,
      date
    })
    .end()

  response.assertStatus(201)
  response.assertJSONSubset({
    title,
    description,
    location,
    date
  })
})

test('cannot create a meetup if the user is not authenticated', async ({
  client
}) => {
  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = { title, description, location, date }

  const response = await client
    .post('/meetups')
    .send(data)
    .end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'E_INVALID_JWT_TOKEN: jwt must be provided',
      name: 'InvalidJwtToken'
    }
  })
})

test('cannot create a meetup with empty title', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const { description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = {
    description,
    location,
    date
  }

  const response = await client
    .post('/meetups')
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'The title is required.',
      field: 'title',
      validation: 'required'
    }
  ])
})

test('cannot create a meetup with empty description', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = {
    title,
    location,
    date
  }

  const response = await client
    .post('/meetups')
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'The description is required.',
      field: 'description',
      validation: 'required'
    }
  ])
})

test('cannot create a meetup if title, description and location are not of string type', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const { date } = await Factory.model('App/Models/Meetup').make()

  const data = {
    title: 123,
    description: 123,
    location: 123,
    date
  }

  const response = await client
    .post('/meetups')
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'The title should be a STRING.',
      field: 'title',
      validation: 'string'
    },
    {
      message: 'The description should be a STRING.',
      field: 'description',
      validation: 'string'
    },
    {
      message: 'The location should be a STRING.',
      field: 'location',
      validation: 'string'
    }
  ])
})

test('cannot create a meetup if date has already passed', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, description, location } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = {
    title,
    description,
    location,
    date: format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss'-03:00'")
  }

  const response = await client
    .post('/meetups')
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: `The date should be a date after ${format(
        new Date(),
        "yyyy-MM-dd'T'HH"
      )}`,
      field: 'date',
      validation: 'after'
    }
  ])
})

'use strict'

const { test, trait, afterEach } = use('Test/Suite')('Show Meetup')

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

test('cannot show a meetup if the user is not authenticated', async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = { title, description, location, date }
  const meetup = await Meetup.create({
    ...data,
    user_id: user.id
  })

  const response = await client.get(`/meetups/${meetup.id}`).end()

  response.assertStatus(401)
  response.assertText(
    'InvalidJwtToken: E_INVALID_JWT_TOKEN: jwt must be provided'
  )
})

test('can show a meetup', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const file = await Factory.model('App/Models/File').create()

  const { title, description, location, date } = await Factory.model(
    'App/Models/Meetup'
  ).make()

  const data = { title, description, location, date }
  const meetup = await Meetup.create({
    ...data,
    file_id: file.id,
    user_id: user.id
  })

  const response = await client
    .get(`/meetups/${meetup.id}`)
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    id: meetup.id,
    title: meetup.title,
    description: meetup.description,
    location: meetup.location,
    file_id: file.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password
    },
    file: {
      file: file.file,
      name: file.name
    }
  })
})

'use strict'

const { test, trait, afterEach } = use('Test/Suite')('List User Subscriptionsn')

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

test('cannot list subscriptions if the user is not authenticated', async ({
  client
}) => {
  const response = await client.get(`/subscriptions`).end()

  response.assertStatus(401)
  response.assertJSONSubset({
    error: {
      message: 'E_INVALID_JWT_TOKEN: jwt must be provided',
      name: 'InvalidJwtToken'
    }
  })
})

test('can list subscriptions', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const meetups = await Factory.model('App/Models/Meetup').createMany(21)
  const userSubscriptions = []

  for (let i = 0; i < meetups.length; i++) {
    userSubscriptions[i] = await Subscription.create({
      user_id: user.id,
      meetup_id: meetups[i].id
    })
  }

  const response = await client
    .get(`/subscriptions`)
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    page: 1,
    data: [
      {
        name: user.name,
        email: user.email,
        password: user.password,
        subscriptions: [
          {
            user_id: user.id,
            meetup_id: meetups[0].id
          },
          {
            user_id: user.id,
            meetup_id: meetups[1].id
          }
        ]
      }
    ]
  })
})

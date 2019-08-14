'use strict'

const { test, trait, afterEach } = use('Test/Suite')('List Meetups')

const Factory = use('Factory')
const User = use('App/Models/User')
const Meetup = use('App/Models/Meetup')

trait('Test/ApiClient')
trait('Auth/Client')

afterEach(async () => {
  await User.query().delete()
  await Meetup.query().delete()
})

test('make sure 2 + 2 is 4', async ({ assert }) => {
  assert.equal(2 + 2, 4)
})

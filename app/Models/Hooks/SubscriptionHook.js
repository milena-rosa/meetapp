'use strict'

const Kue = use('Kue')
const Job = use('App/Jobs/NewSubscriptionMail')

const SubscriptionHook = (exports = module.exports = {})

SubscriptionHook.sendNewSubscriptionMail = async subscriptionInstance => {
  const { email, name } = await subscriptionInstance.user().fetch()
  const meetup = await subscriptionInstance.meetup().fetch()
  const meetupOwner = await meetup.user().fetch()

  Kue.dispatch(Job.key, { meetupOwner, meetup, name, email }, { attempts: 3 })
}

'use strict'

const { parseISO, startOfDay, endOfDay } = require('date-fns')

const Database = use('Database')
const Meetup = use('App/Models/Meetup')
const Subscription = use('App/Models/Subscription')

class SubscriberMeetupController {
  /**
   * Show a list of all meetups that the logged
   * user can subscribe to.
   * A date can also be passed by query params to filter meetups by date.
   *
   * GET subscriberMeetups
   */
  async index ({ request, auth }) {
    // get 'page' and 'date' params
    const { date } = request.get(['date'])

    const meetups = await Meetup.query()
      .where(function () {
        // verify if date is
        if (date) {
          const parsedDate = parseISO(date)
          this.whereBetween('date', [
            startOfDay(parsedDate),
            endOfDay(parsedDate)
          ])
        }
      })
      .whereDoesntHave('subscriptions', builder => {
        builder.where('user_id', auth.user.id)
      })
      .whereNot('user_id', auth.user.id) // meetups not created by the logged user
      .where('date', '>', new Date())
      .orderBy('date') // just the most recent meetups
      .with('user') // with user the organizer data
      .with('file') // with banner data
      .fetch()

    return meetups
  }

  /**
   * Display a single meetup with data of the organizer of the event and of
   * the banner file.
   *
   * GET subscriberMeetups/:id
   */
  async show ({ params }) {
    const meetup = await Meetup.findOrFail(params.id)

    await meetup.load('user')
    await meetup.load('file')
    await meetup.load('subscriptions')

    return meetup
  }
}

module.exports = SubscriberMeetupController

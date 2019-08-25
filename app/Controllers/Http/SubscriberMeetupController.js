'use strict'

const { parseISO, startOfDay, endOfDay } = require('date-fns')

const Meetup = use('App/Models/Meetup')

class SubscriberMeetupController {
  /**
   * Show a list of all meetups that the logged
   * user can subscribe to.
   * A date can also be passed by query params to filter meetups by date.
   *
   * GET meetups
   */
  async index ({ request, auth }) {
    // get 'page' and 'date' params
    const { date } = request.get(['page', 'date'])

    const meetups = await Meetup.query()
      .where(function () {
        // verify if date was passed
        if (date) {
          const parsedDate = parseISO(date)
          this.whereBetween('date', [
            startOfDay(parsedDate),
            endOfDay(parsedDate)
          ])
        }
      })
      .whereNot('user_id', auth.user.id) // logged user
      .where(function () {
        this.where('date', '>', new Date()) // just the most recent meetups
      })
      .with('user') // with user the organizer data
      .with('file') // with banner data
      .fetch()

    return meetups
  }

  /**
   * Display a single meetup with data of the organizer of the event and of
   * the banner file.
   *
   * GET meetups/:id
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

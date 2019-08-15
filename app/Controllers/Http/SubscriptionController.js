'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { areIntervalsOverlapping, addHours, subHours } = require('date-fns')

const Subscription = use('App/Models/Subscription')
const Meetup = use('App/Models/Meetup')
const User = use('App/Models/User')

/**
 * Resourceful controller for interacting with subscriptions
 */
class SubscriptionController {
  /**
   * Show a list of all subscriptions that the logged user is subscripted to
   * and has not passed yet.
   *
   * GET subscriptions
   */
  async index ({ request, auth }) {
    const { page = 1 } = request.get(['page'])

    const userMeetups = await User.query()
      .where('id', auth.user.id)
      .with('subscriptions.meetup', builder => {
        builder.where('date', '>', new Date()).orderBy('date')
      })
      .paginate(page, 10)

    return userMeetups
  }

  /**
   * Create/save a new subscription.
   * An user can subscript to meetups that:
   *  - He/She does not own
   *  - Have not happened yet
   *  - He/She is not already subscribed to
   *  - Does not happen at the same time of another meetup
   *
   * POST subscriptions
   */
  async store ({ params, auth, response }) {
    try {
      const userId = auth.user.id
      const meetup = await Meetup.findByOrFail('id', params.idMeetup)

      // verify if user is the owner of the meetup
      if (userId === meetup.user_id) {
        return response.status(400).send({
          error: { message: 'You cannot subscribe to a meetup you own.' }
        })
      }

      // verify meetup date
      if (meetup.toJSON().past) {
        return response.status(400).send({
          error: {
            message:
              'You cannot subscribe to a meetup that has already happened.'
          }
        })
      }

      // verify if the user has already subscribed to the meetup
      const alreadySubscribed = await Subscription.query()
        .where('user_id', userId)
        .where('meetup_id', meetup.id)
        .fetch()

      if (alreadySubscribed.rows.length > 0) {
        return response.status(400).send({
          error: {
            message: 'You have already subscribed to this meetup.'
          }
        })
      }

      // verify if the user is not subscribed to other event one hour before or
      // one hour after the meetup he/she is trying to subscribe to.
      const userSubscriptions = await Subscription.query()
        .where('user_id', userId)
        .with('meetup')
        .fetch()

      const dateTaken = userSubscriptions.rows.filter(subscription =>
        areIntervalsOverlapping(
          {
            start: subHours(subscription.toJSON().meetup.date, 1),
            end: addHours(subscription.toJSON().meetup.date, 1)
          },
          { start: subHours(meetup.date, 1), end: addHours(meetup.date, 1) }
        )
      )

      if (dateTaken.length > 0) {
        return response.status(400).send({
          error: { message: 'This meetup overlaps another meetup date/time.' }
        })
      }

      const subscription = await Subscription.create({
        user_id: userId,
        meetup_id: meetup.id
      })

      // TODO: enviar e-mail para o owner da meetup

      return subscription
    } catch (err) {
      return response.status(400).send({
        error: {
          message: 'Something went wrong while subscribing to the meetup.',
          err: `${err.name}: ${err.message}`
        }
      })
    }
  }
}

module.exports = SubscriptionController

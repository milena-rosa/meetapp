'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { isBefore, parseISO, startOfDay, endOfDay } = require('date-fns')

const Meetup = use('App/Models/Meetup')

/**
 * Resourceful controller for interacting with meetups
 */
class MeetupController {
  /**
   * Show a paginated list (10 itens per page) of all meetups owned by the
   * logged user.
   * A date can also be passed by query params to filter meetups by date.
   *
   * GET meetups
   */
  async index ({ request, auth }) {
    // get 'page' and 'date' params
    const { page, date } = request.get(['page', 'date'])

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
      .where('user_id', auth.user.id) // logged user
      .where(function () {
        this.where('date', '>', new Date()) // just the most recent meetups
      })
      .with('user') // with user the organizer data
      .with('file') // with banner data
      .paginate(page, 10)

    return meetups
  }

  /**
   * Create/save a new meetup.
   * An user can create meetups with 'title', 'description', 'location', 'date'
   * and 'time'. All fields are required.
   *
   * It is not possible to store meetups with past date/time.
   *
   * POST meetups
   */
  async store ({ request, response, auth }) {
    const user = await auth.getUser()
    const meetup = await Meetup.create({
      ...request.only(['title', 'description', 'location', 'date']),
      user_id: user.id
    })
    return response.created(meetup)
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
    // await meetup.load('subscriptions')

    return meetup
  }

  /**
   * Update meetup details. The user that owns the meetup can modify data of
   * events that have not passed yet.
   *
   * PUT meetups/:id
   */
  async update ({ params, auth, request, response }) {
    try {
      const meetup = await Meetup.findOrFail(params.id)
      const loggedUserId = auth.user.id

      // verify if the meetup owner is the logged user.
      if (meetup.user_id !== loggedUserId) {
        return response.status(401).send({
          error: {
            message: 'You do not have permission to modify this meetup.'
          }
        })
      }

      const date = request.input('date')
      // verify the date
      if (isBefore(parseISO(date), new Date())) {
        return response.status(400).send({
          error: {
            message:
              'You cannot update the meetup with a date/time that has already passed.'
          }
        })
      }

      // verify if the meetup date has already passed.
      if (meetup.toJSON().past) {
        return response.status(401).send({
          error: {
            message: 'You cannot modify a meetup that has already passed.'
          }
        })
      }

      // if all good, update meetup
      const data = request.only(['title', 'description', 'location', 'file_id'])
      meetup.merge({ ...data, date })
      await meetup.save()
      return meetup
    } catch (err) {
      return response.status(400).send({
        error: {
          message: 'Something went wrong while updating the meetup.',
          err: `${err.name}: ${err.message}`
        }
      })
    }
  }

  /**
   * Delete a meetup with id. This method is used when the owner user wants to
   * cancel the meetup.
   *
   * It is not possible to cancel meetups with past date/time.
   *
   * DELETE meetups/:id
   */
  async destroy ({ params, auth, response }) {
    try {
      const meetup = await Meetup.findOrFail(params.id)
      const loggedUserId = await auth.user.id

      // verify if the meetup owner is the logged user.
      if (meetup.user_id !== loggedUserId) {
        return response.status(401).send({
          error: {
            message: 'You do not have permission to cancel this meetup.'
          }
        })
      }

      // verify if the meetup date has already passed.
      if (meetup.toJSON().past) {
        return response.status(401).send({
          error: {
            message: 'You cannot cancel a meetup that has already passed.'
          }
        })
      }

      await meetup.delete()

      return response.send({ message: 'ok' })
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Something went wrong while cancelling the meetup.',
          err: `${err.name}: ${err.message}`
        }
      })
    }
  }
}

module.exports = MeetupController

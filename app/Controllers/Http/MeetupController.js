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
   * GET meetups
   */
  async index ({ request, auth }) {
    // get 'page' and 'date' params
    const { page, date } = request.get(['page', 'date'])

    console.log(page, date)
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
   * Display a single meetup.
   * GET meetups/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params }) {}

  /**
   * Update meetup details.
   * PUT or PATCH meetups/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, auth, request, response }) {}

  /**
   * Delete a meetup with id.
   * DELETE meetups/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, auth, response }) {}
}

module.exports = MeetupController

'use strict'

const { format } = require('date-fns')
const Antl = use('Antl')

class CreateMeetup {
  get validateAll () {
    return true
  }

  get messages () {
    return Antl.list('validation')
  }

  async fails (errorMessages) {
    return this.ctx.response.status(400).json(errorMessages)
  }

  get rules () {
    const today = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'-03:00'")
    return {
      title: 'required|string',
      description: 'required|string|max:255',
      location: 'required|string',
      date: `required|date|after:${today}`
    }
  }
}

module.exports = CreateMeetup

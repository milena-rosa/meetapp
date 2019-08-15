'use strict'

const Mail = use('Mail')

class NewSubscriptionMail {
  static get concurrency () {
    return 1
  }

  static get key () {
    return 'NewSubscriptionMail-job'
  }

  async handle ({ meetupOwner, meetup, name, email }) {
    console.log(`Job: ${NewSubscriptionMail.key}`)

    await Mail.send(
      ['emails.new_subscription'],
      { ownerName: meetupOwner.name, title: meetup.title, name, email },
      message =>
        message
          .to(meetupOwner.email)
          .from('noreply@meetapp.com', 'Equipe MeetApp')
          .subject('Nova inscrição em sua Meetup!')
    )
  }
}

module.exports = NewSubscriptionMail

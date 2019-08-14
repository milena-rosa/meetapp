'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */

const { format } = require('date-fns')
const faker = require('faker')

const Factory = use('Factory')

Factory.blueprint('App/Models/User', () => {
  return {
    name: faker.name.findName(),
    email: faker.internet.email().toLowerCase(),
    password: '12345678'
  }
})

Factory.blueprint('App/Models/File', () => {
  return {
    file: '12345678910.png',
    name: 'teste.png',
    type: 'image',
    subtype: 'png'
  }
})

Factory.blueprint('App/Models/Meetup', () => {
  return {
    title: faker.lorem.sentence(5),
    description: faker.lorem.paragraph(2),
    location: faker.address.city(),
    date: format(
      faker.date.future(5, new Date()),
      "yyyy-MM-dd'T'HH:mm:ss'-03:00'"
    )
  }
})

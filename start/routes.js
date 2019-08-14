'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

// tested
Route.post('users', 'UserController.store').validator('CreateUser')

// tested
Route.post('sessions', 'SessionController.store').validator('Session')

// tested
Route.post('passwords', 'ForgotPasswordController.store').validator(
  'ForgotPassword'
)

// tested
Route.put('passwords', 'ForgotPasswordController.update').validator(
  'ResetPassword'
)

// tested
Route.get('files/:id', 'FileController.show')

Route.group(() => {
  // tested
  Route.put('users', 'UserController.update').validator('UpdateUser')
  // tested
  Route.post('files', 'FileController.store').validator('CreateImageFile')

  // store: tested
  // index: tested
  // show: tested
  // update: tested
  // delete: tested
  Route.resource('meetups', 'MeetupController')
    .apiOnly()
    .validator(new Map([[['meetups.store'], ['CreateMeetup']]]))
  // Route.post('meetups', 'MeetupController.store').validator('CreateMeetup')
}).middleware(['auth'])

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

Route.post('users', 'UserController.store').validator('CreateUser')

Route.post('sessions', 'SessionController.store').validator('Session')

Route.post('passwords', 'ForgotPasswordController.store').validator(
  'ForgotPassword'
)
Route.put('passwords', 'ForgotPasswordController.update').validator(
  'ResetPassword'
)

Route.get('files/:id', 'FileController.show')
Route.get('avatars/:id', 'AvatarController.show')

Route.group(() => {
  Route.put('users', 'UserController.update').validator('UpdateUser')

  Route.post('files', 'FileController.store').validator('CreateImageFile')

  Route.post('avatars', 'AvatarController.store').validator('CreateImageFile')

  Route.resource('meetups', 'MeetupController')
    .apiOnly()
    .validator(new Map([[['meetups.store'], ['CreateMeetup']]]))

  Route.get('subscriberMeetups', 'SubscriberMeetupController.index')
  Route.post('subscriptions/:idMeetup', 'SubscriptionController.store')
  Route.get('subscriptions', 'SubscriptionController.index')
  Route.delete('subscriptions/:id', 'SubscriptionController.destroy')
}).middleware(['auth'])

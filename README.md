# MeetApp API

This is an API server created in AdonisJs. MeetApp is an event aggregator app for developers (an acronym for Meetup + App).


## Features

Following are the features available in MeetApp.


### Authentication

A user can authenticate to the app using an *email* and *password*.
- Authentication is done using JWT;
- Input data validation is performed.


### User registration and Update 

New users can register in the application using *name*, *email* and *password*.
- The user's password is encrypted for security;
- Input data validation is performed.


### Reset password feature

The user can recover or restart his/her password using an *email*. A key is generated internally and sent to the user by email. Using that *key*, and a new *password* he/she can reset the password.


### File management

There are two routes to upload image files to the API: **/avatars**, which is responsible for dealing with profile images, and **/files**, which handles the meetup's banners.


### Meetups management

The user can register meetups on the platform with meetup *title*, *description*, *location*, *date* and *time* and *banner image*, being all fields required. Also there is an *user_id* field that stores the ID of the user that organizes the event.
The user can also edit and cancel meetups that he organizes that have not happened yet. The cancelling deletes the meetup from database.
It is not possible to register meetups with dates that have passed.


### Meetup subscriptions

An user can subscript to meetups that:
- He/She does not own;
- Have not happened yet;
- He/She is not already subscribed to;
- Does not happen in the interval between one hour before and one hour after the time of another meetup.
Every time an user subscribes to a meetup, an email is sent to its organizer.


### Meetup listing

There are two routes to list meetups. The first one, **/meetups**, shows a paginated list (10 itens per page) of all meetups organized by the logged user. The second route, **/subscriberMeetups** shows a list of all meetups that the logged user can subscribe to. In both routes, a date can be passed by query params to filter meetups by date.


### Subscription listing

The route **/subscriptions** lists the meetups that the logged user has subscribed to. Only meetups that have not happen are shown ordered by date (closer meetups first).


## CRUD Routes

| Route                    | Verb(s) | Handler                          | Middleware              |
|--------------------------|---------|----------------------------------|-------------------------|
| /users                   | POST    | UserController.store             | av:CreateUser           |
| /sessions                | POST    | SessionController.store          | av:Session              |
| /passwords               | POST    | ForgotPasswordController.store   | av:ForgotPassword       |
| /passwords               | PUT     | ForgotPasswordController.update  | av:ResetPassword        |
| /files/:id               | GET     | FileController.show              |                         |
| /avatars/:id             | GET     | AvatarController.show            |                         |
| /users                   | PUT     | UserController.update            | auth,av:UpdateUser      |
| /files                   | POST    | FileController.store             | auth,av:CreateImageFile |
| /avatars                 | POST    | AvatarController.store           | auth,av:CreateImageFile |
| /meetups                 | GET     | MeetupController.index           | auth                    |
| /meetups                 | POST    | MeetupController.store           | auth,av:CreateMeetup    |
| /meetups/:id             | GET     | MeetupController.show            | auth                    |
| /meetups/:id             | PUT     | MeetupController.update          | auth                    |
| /meetups/:id             | DELETE  | MeetupController.destroy         | auth                    |
| /subscriberMeetups       | GET     | SubscriberMeetupController.index | auth                    |
| /subscriptions/:idMeetup | POST    | SubscriptionController.store     | auth                    |
| /subscriptions           | GET     | SubscriptionController.index     | auth                    |
| /subscriptions/:id       | DELETE  | SubscriptionController.destroy   | auth                    |


## Setup

Manually clone the repo and then run `npm install` or `yarn`.


### Migrations

The API uses two databases: a Postgres relational database to store users and meetups informations and a Redis key-value database to deal with queue processes. Both need to be setup and its info set in the .env file.

Run the following command to run startup migrations.

```js
adonis migration:run
```

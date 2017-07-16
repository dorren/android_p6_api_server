## Data Models

<pre>
 User
  email: String
  password: String
  avatar: String
  name: String

Event
  title: String
  detail: String
  image_url: URL
  location: String
  time_from: dateTime
  time_to: dateTime
  src: url to source url
  organizer_id: user_id

UserEvents
  user_id
  event_id
  created_at: timestamp
  saved: boolean
  confirmed: boolean

</pre>

## APIs

<pre>
GET /users/<ID>
PUT /users/<ID>

GET /users/<ID>/events

POST /events
GET  /events/<ID>

POST   /events/<EVENT_ID>/bookmark  {user_id: <USER_ID>}
DELETE /events/<EVENT_ID>/bookmark  {user_id: <USER_ID>}
POST   /events/<EVENT_ID>/confirm   {user_id: <USER_ID>}
DELETE /events/<EVENT_ID>/confirm   {user_id: <USER_ID>}
</pre>

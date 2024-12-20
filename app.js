const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))


// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL)
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, PATCH, PUT, DELETE, OPTIONS'
//   );

//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }

//   next()
// })

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404)
  throw error
})

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    })
  }
  if (res.headerSent) {
    return next(error)
  }

  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occurred!' })
})

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.woafy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => {
    app.listen(process.env.PORT || 5000)
  })
  .catch((error) => {
    console.log(error);

  })

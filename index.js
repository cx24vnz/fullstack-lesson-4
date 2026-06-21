const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')
const { info, error } = require('./utils/logger')

const blogRouter = require('./controllers/blog')
const usersRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')

const middleware = require('./utils/middleware')


// config
const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)


// midleware usage
app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)
app.use(middleware.getTokenAndAddToRequest)





app.use('/api/blogs', blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'testE2E') {
   console.log("testing allowed")
   const testingRouter = require('./controllers/testing')
   app.use('/api/testing', testingRouter)
}




app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const PORT = config.PORT


if (process.env.NODE_ENV !== 'test') {

   app.listen(PORT, () => {
      info(`Server running on port ${config.PORT}`)
   })

}

module.exports = app;


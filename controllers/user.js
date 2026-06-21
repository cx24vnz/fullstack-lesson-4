const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {

  
     let users= await User.find({}).populate("blogs",
     { title:1,
      author: 1,
      url:1,
      likes:1})
  response.status(200).json(users)
 
 
      
  })

usersRouter.post('/', async (request, response, next) => {
 

    const { username, name, password } = request.body

  if (password.length < 3 ) {

    // custom error
    const validationError = new Error("Password is too short");
    validationError.name = "ValidationError"
    throw  validationError
   
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save() 
  response.status(201).json(savedUser)

})

module.exports = usersRouter
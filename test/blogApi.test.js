const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../index')

const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: "hey",
    author: "me",
    url: "www",
    likes: 4
  },
  {
    title: "hey 22",
    author: "me",
    url: "www",
    likes: 5
  },
]


beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})



test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')

    .expect(200)

    .expect('Content-Type', /application\/json/)


})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('the first blog title is hey', async () => {
  const response = await api.get('/api/blogs')

  const title = response.body.map(e => e.title)
  assert(title.includes('hey'))
})

test('the blog id is id', async () => {
  const response = await api.get('/api/blogs')

  const id = response.body.map(e => e.id)
  assert.ok(id)



})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "Einstein",
    author: "me",
    url: "www",
    likes: 12
  }


  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, initialBlogs.length + 1)

  assert(titles.includes('Einstein'))




})

test('a valid blog can be added with like = 0', async () => {
  const newBlog = {
    title: "Einstein",
    author: "me",
    url: "www"

  }


  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const likesList = response.body.map(r => r.likes)

  assert.strictEqual(likesList[2], 0)


})

test('should reject blogs without title or url', async () => {
  const newBlog = {
    
    author: "me",
    url: "www"

  }


  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(400)
  

  const newBlog2 = {
    title: "Einstein",
    author: "me",
    likes: 12
  }

  await api
  .post('/api/blogs')
  .send(newBlog2)
  .expect(400)
 


})


test('delete by id', async () => {

  const response = await api.get('/api/blogs')

  const ids = response.body.map(e => e.id)

  const idToDelete = ids[0]
  
  await api
  .delete('/api/blogs/' + idToDelete)
  .expect(204)

  const response2 = await api.get('/api/blogs')

  const ids2 = response2.body.map(e => e.id)

  const stillThere = ids2.includes(idToDelete)


  assert.strictEqual(stillThere, false)


  


})

test('Update test', async () => {
  const newBlog = {
    title: "Einstein",
    author: "me",
    url: "www",
    likes: 12
  }

 // add
  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  // get
  const response = await api.get('/api/blogs')

  const ids = response.body.map(e => e.id)

  const idToUpdate = ids[initialBlogs.length ]

  // modify
  const testLikesValue = 1665

  const newBlog2 = {
    title: "Einstein",
    author: "me",
    url: "www",
    likes: testLikesValue
  }

  await api
  .put('/api/blogs/' + idToUpdate)
  .send(newBlog2)
  .expect(200)

  //check mod
  const response2 = await api.get('/api/blogs')

  const likes = response2.body.map(e => e.likes)

  let updated= likes.includes(testLikesValue)

  assert.strictEqual(updated, true)






})







// when all test are done
after(async () => {

  await mongoose.connection.close()

})
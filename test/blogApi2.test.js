const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");

const mongoose = require("mongoose");
const supertest = require("supertest");

const app = require("../index");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Blog = require("../models/blog");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);
  const user = new User({ username: "root", passwordHash });

  await user.save();
});

describe("user creation test", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation with a bad username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "ml",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(!usernames.includes(newUser.username));
  });
  test("creation with a repeated username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "root",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });
  test("creation with a bad password", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "rootmania",
      name: "Matti Luukkainen",
      password: "sa",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // check nothing is added
    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(!usernames.includes(newUser.username));
  });
});

describe("blog creation test", () => {
  test("creation succeeds with a root user", async () => {
    const blogsAtStart = await blogsInDb();

    const newBlog = {
      title: "root blog",
      author: "me",
      url: "www",
      likes: 12,
    };

    const user = { username: "root", password: "sekret" }

    let responseLogin = await api
      .post("/api/login")
      .send(user)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    let authToken = responseLogin.body.token
    console.log(responseLogin.body.token);

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const titles = response.body.map((r) => r.title);

    assert.strictEqual(response.body.length, blogsAtStart.length + 1);

    assert(titles.includes("root blog"));
  });
  test("creation fails without auth token", async () => {
    const blogsAtStart = await blogsInDb();

    const newBlog = {
      title: "root blog",
      author: "me",
      url: "www",
      likes: 12,
    };


    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const titles = response.body.map((r) => r.title);

    assert.strictEqual(response.body.length, blogsAtStart.length);

  });

});

// when all test are done
after(async () => {
  await mongoose.connection.close();
});

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((u) => u.toJSON());
};

import request from 'supertest'
import app from 'server'
import prisma from 'database'

const server = app()

describe('POST /register', () => {
  it('Responds with JSON', (done) => {
    request(server)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send({
        username: 'jrtoruhn',
        password: 'johndue1234',
        email: 'johnrdtrruoe@domain.com'
      })
      .type('json')
      .expect(201, done)
  })

  it('throws error when invalid email', (done) => {
    request(server)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send({
        username: 'jrtoruhn',
        password: 'johndue1234',
        email: 'invalid_email'
      })
      .type('json')
      .expect(400, { error: 'email must be a valid email' }, done)
  })

  it('throws error when the email already exists', async () => {
    const data = {
      username: 'jrtoruhn',
      password: 'johndue1234',
      email: 'johnrdtrruoe@domain.com'
    }

    await prisma.user.create({
      data
    })

    await request(server)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send({ ...data, username: 'jrtoruhn2' })
      .type('json')
      .expect(409, { d: 1 })
  })

  it('throws error when the username already exists', async () => {
    const data = {
      username: 'jrtoruhn',
      password: 'johndue1234',
      email: 'johnrdtrruoe@domain.com'
    }

    await prisma.user.create({
      data
    })

    await request(server)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send({ ...data, email: 'johnrdtrruoe@domain.com' })
      .type('json')
      .expect(509, { d: 1 })
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.user.deleteMany()
})

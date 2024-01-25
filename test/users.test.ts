import { expect, test, beforeAll, afterAll, beforeEach, describe } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      })
      .expect(201)
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to list all users', async () => {
    await request(app.server).post('/users').send({
      name: 'gabriel lima',
      email: 'gabriellima@gmail.com',
      password: '12334322',
    })

    await request(app.server).post('/users').send({
      name: 'amanda lima',
      email: 'amandalima@gmail.com',
      password: '12334322',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    expect(listUsersResponse.body.users).toHaveLength(2)

    expect(listUsersResponse.body.users[0].name).toBe('gabriel lima')
    expect(listUsersResponse.body.users[1].name).toBe('amanda lima')
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to list a specific user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'gabriel lima',
      email: 'gabriellima@gmail.com',
      password: '12334322',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = listUsersResponse.body.users[0].id

    const getUserResponse = await request(app.server)
      .get(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getUserResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      }),
    )
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to update a user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'gabriel lima',
      email: 'gabriellima@gmail.com',
      password: '12334322',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = listUsersResponse.body.users[0].id

    await request(app.server)
      .put(`/users/${userId}`)
      .set('Cookie', cookies)
      .send({
        name: 'tiago lima',
        email: 'tiago@gmail.com',
        password: 'password123',
      })
      .expect(204)
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to delete a user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'gabriel lima',
      email: 'gabriellima@gmail.com',
      password: '12334322',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = listUsersResponse.body.users[0].id

    await request(app.server)
      .delete(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(204)
  })
})

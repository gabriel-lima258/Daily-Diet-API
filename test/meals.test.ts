import { expect, test, beforeAll, afterAll, beforeEach, describe } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'

describe('Meals routes', () => {
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

  test('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Eggs at the morning',
        description: 'Breakfast super huge',
        isOnDiet: false,
      })
      .expect(201)
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to list all the meals', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Eggs in the morning',
        description: 'Breakfast super huge',
        isOnDiet: false,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'bacon with fries',
        description: 'It is a huge hamburguer',
        isOnDiet: false,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    expect(listMealResponse.body.meals).toHaveLength(2)

    // this validate is necessry in case the order is correct
    expect(listMealResponse.body.meals[0].name).toBe('Eggs in the morning')
    expect(listMealResponse.body.meals[1].name).toBe('bacon with fries')
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to list a meal by id', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Banana with whey',
        description: 'Breakfast',
        isOnDiet: true,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Banana with whey',
        description: 'Breakfast',
        is_on_diet: 1,
      }),
    )
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Banana with whey',
        description: 'Breakfast',
        isOnDiet: true,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Hot dog',
        description: 'with a lot of ketchup',
        isOnDiet: false,
      })
      .expect(204)
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Banana with whey',
        description: 'Breakfast',
        isOnDiet: true,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(204)
  })

  /// ////////////////////////////////////////////////////////

  test('should be able to get the metrics', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'gabriel lima',
        email: 'gabriellima@gmail.com',
        password: '12334322',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Eggs in the morning',
        description: 'Breakfast super huge',
        isOnDiet: false,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Banana with whey',
        description: 'breakfast',
        isOnDiet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .send({
        name: 'Rice with chicken',
        description: 'lunch',
        isOnDiet: true,
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', createUserResponse.get('Set-Cookie'))
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 3,
      totalMealsOnDiet: 2,
      totalMealsOffDiet: 1,
    })
  })
})

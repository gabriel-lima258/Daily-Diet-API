import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  // creating a new meal
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
      })

      const { name, description, isOnDiet } = createMealsBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        user_id: request.user?.id,
        name,
        description,
        is_on_diet: isOnDiet,
      })

      return response.status(201).send()
    },
  )

  // getting all the meals from the user
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const meals = await knex('meals')
        .where({ user_id: request.user?.id })
        .select()

      return response.send({ meals })
    },
  )

  // getting meal by id
  app.get(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id: mealId,
          user_id: request.user?.id,
        })
        .first()

      if (!meal) {
        return response.status(404).send({
          error: 'Meal not found',
        })
      }

      return response.send({ meal })
    },
  )

  // updating meal
  app.put(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealParamsSchema.parse(request.params)

      const updateMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
      })

      // eslint-disable-next-line prettier/prettier
      const { name, description, isOnDiet } = updateMealSchema.parse(request.body)

      const meal = await knex('meals')
        .where({
          id: mealId,
          user_id: request.user?.id,
        })
        .first()

      if (!meal) {
        return response.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where('id', mealId).update({
        name,
        description,
        is_on_diet: isOnDiet,
        updated_at: knex.fn.now(),
      })

      return response.status(204).send()
    },
  )

  // deleting meal
  app.delete(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id: mealId,
          user_id: request.user?.id,
        })
        .first()

      if (!meal) {
        return response.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where('id', mealId).delete()

      return response.status(204).send()
    },
  )

  // getting the metrics meal
  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request, response) => {
      const totalMealsOnDiet = await knex('meals')
        .where({ user_id: request.user?.id, is_on_diet: true })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOffDiet = await knex('meals')
        .where({ user_id: request.user?.id, is_on_diet: false })
        .count('id', { as: 'total' })
        .first()

      const totalMeals = await knex('meals')
        .where({ user_id: request.user?.id })
        .orderBy('name', 'asc')

      return response.send({
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
      })
    },
  )
}

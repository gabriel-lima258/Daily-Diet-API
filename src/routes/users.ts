import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  // method get for all users created
  app.get('/', async (request, response) => {
    const users = await knex('users').select()

    return response.send({ users })
  })

  // method get for get user by id
  app.get('/:id', async (request, response) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(request.params)

    const user = await knex('users').where('id', id).first()

    if (!user) {
      return response.status(404).send({ error: 'User not found' })
    }

    return response.send({ user })
  })

  // Create method for users
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      response.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { name, email, password } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      password,
      session_id: sessionId,
    })

    return response.status(201).send()
  })

  // delete method for users
  app.delete('/:id', async (request, response) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(request.params)

    const user = await knex('users').where('id', id).first()

    if (!user) {
      return response.status(404).send({ error: 'User not found' })
    }

    await knex('users').where('id', id).delete()

    return response.status(204).send()
  })

  // uptade method
  app.put('/:id', async (request, response) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(request.params)

    const updateUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = updateUserBodySchema.parse(request.body)

    const user = await knex('users').where('id', id).first()

    if (!user) {
      return response.status(404).send({ error: 'User not found' })
    }

    await knex('users').where('id', id).update({
      name,
      email,
      password,
      updated_at: knex.fn.now(),
    })

    return response.status(204).send()
  })
}

import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'

export async function checkSessionIdExists(
  request: FastifyRequest,
  response: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return response.status(401).send({
      error: 'User not unauthorized',
    })
  }

  const user = await knex('users').where({ session_id: sessionId }).first()

  if (!user) {
    return response.status(401).send({
      error: 'User not authorized',
    })
  }

  request.user = user
}

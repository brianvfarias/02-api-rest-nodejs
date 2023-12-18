import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'
import { checkIfSessionIDExists } from '../middlewares/check-session-id-existance'

export async function transactionRoutes(app: FastifyInstance) {
  // app.get('/db', async (req, res) => {
  //   // console.log(req, res)
  //   const tables = await knex('sqlite_schema').select('*')
  //   console.log(tables)
  //   return res.send(JSON.stringify({ message: 'Hello from DB!' }))
  // })

  app.get(
    '/',
    {
      preHandler: [checkIfSessionIDExists],
    },
    async (req, res) => {
      const { sessionID } = req.cookies
      const transactions = await knex('transactions')
        .orderBy('created_at', 'desc')
        .where('session_id', sessionID)
        .select('*')
      return res.send({ transactions })
    } // eslint-disable-line
  )

  app.get(
    '/:id',
    {
      preHandler: [checkIfSessionIDExists],
    },
    async (req) => {
      const { sessionID } = req.cookies
      const getTransactionParamSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamSchema.parse(req.params)
      const search = await knex('transactions')
        .where('id', id)
        .andWhere('session_id', sessionID)
        .select()
        .first()
      return { search }
    } // eslint-disable-line
  )

  app.get(
    '/summary',
    {
      preHandler: [checkIfSessionIDExists],
    },
    async (req) => {
      const { sessionID } = req.cookies
      const summary = await knex('transactions')
        .where('session_id', sessionID)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    } // eslint-disable-line
  )

  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['debit', 'credit']),
    })

    const { type, title, amount } = createTransactionBodySchema.parse(req.body)

    let sessionID = req.cookies.sessionID

    if (!sessionID) {
      sessionID = crypto.randomUUID()

      res.cookie('sessionID', sessionID, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionID,
    })
    return res.status(201).send({ message: 'Transaction created' })
  })
}

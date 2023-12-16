import { knex as setupKnex, Knex } from 'knex'
import { env } from '../env'

export const config: Knex.Config = {
  client: 'sqlite3', // or 'better-sqlite3'
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
  // connection: {
  //   host: '127.0.0.1',
  //   port: 3306,
  //   user: 'root',
  //   password: '123',
  //   database: 'cadastro',
  // },
}

export const knex = setupKnex(config)

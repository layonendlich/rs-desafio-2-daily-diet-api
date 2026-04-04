import fastify from 'fastify'
import { users } from './controllers/users'

export const app = fastify()

app.register(users, { prefix: '/users' })

app.get('/', () => {
    return 'Hello workld'
})


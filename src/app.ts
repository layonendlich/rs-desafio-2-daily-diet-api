import fastify from 'fastify'
import { users } from './controllers/users'
import { signup } from './controllers/signup'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)
app.register(signup, { prefix: '/signup' })
app.register(users, { prefix: '/users' })

app.get('/', () => {
    return 'Hello workld'
})


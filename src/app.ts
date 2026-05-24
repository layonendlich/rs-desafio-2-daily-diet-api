import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { sessionControl } from './middleware/sessionControl'

/* ROUTE CONTROLLERS */
import { signup } from './controllers/signup'
import { auth } from './controllers/auth'
import { users } from './controllers/users'
import { sessions } from './controllers/sessions'

export const app = fastify()

app.register(cookie)
app.addHook('preHandler', async (request, reply) => {
    await sessionControl(request, reply)
})

app.register(signup, { prefix: '/signup' })
app.register(auth)
app.register(users, { prefix: '/users' })
app.register(sessions, { prefix: '/sessions' })



app.get('/', (request) => {
    return { message: 'Hello World!' }
})


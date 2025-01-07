import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { RequestContext } from '@mikro-orm/core'

import { orm, syncSchema } from './shared/db/orm.js'
import { userRouter } from './user/user.routes.js'
import { ticketRouter } from './ticket/ticket.routes.js'
import { projectRouter } from './project/project.routes.js'
import { ticketStateRouter } from './ticket/ticket-state/ticket-state.routes.js'
import { devotedTimeRouter } from './ticket/devoted-time/devoted-time.routes.js'


const app = express()
const port = process.env.PORT

app.use(express.json())

// configuracion dotenv
dotenv.config()

// mw que permite comunicacion cliente-servidor
app.use(cors())


// luego de los middleware base
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// antes de los middleware de negocio
app.use('/api/users', userRouter)
app.use('/api/projects', projectRouter)
app.use('/api/tickets', ticketRouter)
app.use('/api/ticket-states', ticketStateRouter)
app.use('/api/devoted-time', devotedTimeRouter)
app.use('/api/tickets', devotedTimeRouter)


/// MIDDLEWARE PARA DIRECCIONES INEXISTENTES
app.use((_, res) => {
  res.status(404).send({ message: 'Resource not found' })
})

await syncSchema() // never in production

app.listen(port, () => {
  console.log('Server running on http://localhost:3000')
})

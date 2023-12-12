import 'reflect-metadata'
import express from 'express'
import { projectRouter } from './project/project.routes.js'
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'

const app = express()
app.use(express.json())

// luego de los middleware base

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// antes de los middleware de negocio

app.use('/api/projects', projectRouter)

/// MIDDLEWARE PARA DIRECCIONES INEXISTENTES
app.use((_, res) => {
  res.status(404).send({ message: 'Resource not found' })
})

// await syncSchema() // never in production

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
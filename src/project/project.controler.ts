import { NextFunction, Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Project } from './project.entity.js'

const em = orm.em

/// SANITIZE INPUT

function sanitizeProjectInput(req: Request, res: Response, next: NextFunction){

  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    wiki: req.body.wiki,
    creation_date: req.body.creation_date
  }

  Object.keys(req.body.sanitizedInput).forEach(key =>{
    if(req.body.sanitizedInput[key] === undefined){
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const projects = await em.find(Project, {})

    res
      .status(200)
      .json(projects)
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const project = await em.findOneOrFail(Project, { id })

    res
      .status(200)
      .json({ message: 'found project', data: project})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const project = em.create(Project, req.body)

    await em.flush()

    res
      .status(201)
      .json({ message: 'project created', data: project})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const project = em.getReference(Project, id)

    em.assign(project, req.body)

    await em.flush()

    res
      .status(200)
      .json({ message: 'project updated', data: project})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const project = em.getReference(Project, id)

    await em.removeAndFlush(project)

    res
      .status(204)
      .json({ message: 'project removed', data: project})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

export { sanitizeProjectInput, findAll, findOne, add, update, remove }

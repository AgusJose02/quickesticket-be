import { NextFunction, Request, Response } from 'express'

import { entityManager, entityLoader } from '../../shared/db/orm.js'
import { DevotedTime } from './devoted-time.entity.js'

const em = entityManager;

const loader = entityLoader; // TODO: DELETE OR POPULATE DEVOTED TIME

/// SANITIZE INPUT

function sanitizeDevotedTimeInput(req: Request, res: Response, next: NextFunction){

  req.body.sanitizedInput = {
    ticket: req.body.ticket,
    date: req.body.date,
    amount: req.body.amount,
    description: req.body.description,
    client_time_amount: req.body.client_time_amount,
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
    const times = await em.find(
      DevotedTime,
      {},
      { populate: []}
    )

    res
      .status(200)
      .json(times)
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function findTicketsDevotedTime(req: Request, res: Response) {
  try {
    const ticketId = Number.parseInt(req.params.ticketId)

    const times = await em.qb(DevotedTime)
      .where({ ticket: ticketId})
      .getResultList();
    
    res
      .status(200)
      .json(times)
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const ticketId = Number.parseInt(req.params.ticketId)

    const time = await em.qb(DevotedTime)
      .where({ id: id, ticket: ticketId})
      .getSingleResult();

    res
      .status(200)
      .json(time)
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const time = em.create(DevotedTime, req.body);

    // delete time.id; //elimino el id que viene desde el front

    await em.flush()

    res
      .status(201)
      .json(time)
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const time = em.getReference(DevotedTime, id)

    em.assign(time, req.body)

    await em.flush()

    res
      .status(200)
      .json({ message: 'Devoted time updated', data: time})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const time = em.getReference(DevotedTime, id)

    await em.removeAndFlush(time)

    res
      .status(200)
      .json({ message: 'Devoted time removed', data: time})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

export {sanitizeDevotedTimeInput, findAll, findTicketsDevotedTime, findOne, add, update, remove}
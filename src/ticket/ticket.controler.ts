import { NextFunction, Request, Response } from "express";

import { orm } from '../shared/db/orm.js'
import { Ticket } from "./ticket.entity.js";


const em = orm.em

/// SANITIZE INPUT

function sanitizeTicketInput(req: Request, res: Response, next: NextFunction){

  req.body.sanitizedInput = {
    project: req.body.project,
    creator: req.body.creator,
    responsible: req.body.responsible,
    beginning_date: req.body.beginning_date,
    end_date: req.body.end_date,
    state: req.body.state,
    total_hours: req.body.total_hours,
    title: req.body.title,
    description: req.body.description,
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
    const tickets = await em.find(
      Ticket,
      {},
      { populate: ['project', 'state']}
    )

    res
      .status(200)
      .json(tickets)
  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const ticket = await em.findOneOrFail(Ticket,
      { id },
      { populate: ['project', 'state']}
    )

    res
      .status(200)
      .json(ticket)
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const ticket = em.create(Ticket, req.body);

    delete ticket.id; //elimino el id que viene desde el front
    ticket.beginning_date = ticket.beginning_date.slice(0,10); // el front envia fecha y hora
    ticket.end_date = ticket.end_date.slice(0,10);

    await em.flush()

    res
      .status(201)
      .json(ticket)
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const ticket = em.getReference(Ticket, id)

    em.assign(ticket, req.body)

    await em.flush()

    res
      .status(200)
      .json({ message: 'Ticket updated', data: ticket})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const ticket = em.getReference(Ticket, id)

    await em.removeAndFlush(ticket)

    res
      .status(200)
      .json({ message: 'ticket removed', data: ticket})
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

export { sanitizeTicketInput, findAll, findOne, add, update, remove }

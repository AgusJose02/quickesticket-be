import { Request, Response } from "express";

import { orm } from '../shared/db/orm.js'
import { Ticket } from "./ticket.entity.js";


const em = orm.em

async function findAll(req: Request, res: Response) {
  try {
    const tickets = await em.find(
      Ticket,
      {},
      { populate: ['project']}
    )

    res.status(200).json({ message: 'Finded all tickets', data: tickets})
  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const ticket = await em.findOneOrFail(Ticket, { id })

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
    const ticket = em.create(Ticket, req.body)

    await em.flush()

    res
      .status(201)
      .json({ message: 'Ticket created', data: ticket })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
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

export { findAll, findOne, add, update, remove }

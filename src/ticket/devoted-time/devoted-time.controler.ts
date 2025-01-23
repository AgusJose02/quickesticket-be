import { NextFunction, Request, Response } from 'express'

import { entityManager } from '../../shared/db/orm.js'
import { DevotedTime } from './devoted-time.entity.js'
import { decodeToken } from '../../token-decoder.js';
import { Ticket } from '../ticket.entity.js';
import { Project } from '../../project/project.entity.js';

const em = entityManager;

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
    const token = req.headers.authorization

    if (token) {
      const { userId } = decodeToken(token)
      
      const times = await em.find(
        DevotedTime,
        {user: {id: userId}},
        { populate: [],
          orderBy: {date: 'DESC'}
        },
      )

      res
        .status(200)
        .json(times)
    }
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function findAllFromUser(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userIsAdmin } = decodeToken(token)

      if (userIsAdmin) {
        const id = Number.parseInt(req.params.id)

        const entries = await em.find(
          DevotedTime,
          {user: {id}},
          { populate: [],
            orderBy: {date: 'DESC'}
          },
        )
  
        res
          .status(200)
          .json(entries)
      } else {
      res
        .status(403)
        .json('No posee los permisos necesarios para acceder.')
      } 
    }
      
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function findTicketsDevotedTime(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)     
      const ticketId = Number.parseInt(req.params.ticketId)

      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, ticketId, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para acceder.'
          })
          return
      }

      const times = await em.find(
          DevotedTime,
          {ticket: {id: ticketId}},
          { populate: ['user'],
            orderBy: {date: 'DESC'}
          },
        )
      
      res
        .status(200)
        .json(times)
    }

  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)    
      const id = Number.parseInt(req.params.id)
      const ticketId = Number.parseInt(req.params.ticketId)
      
      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, ticketId, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para acceder a la entrada.'
          })
          return
      }
      
      const time = await em.findOneOrFail(DevotedTime,
        { id, ticket: ticketId}
      )

      res
        .status(200)
        .json(time)
    }
    
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)
      const ticketId = Number.parseInt(req.params.ticketId)
      
      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, ticketId, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para crear la entrada.'
          })
          return
      }

      // Actualizo cantidad total en el ticket
      const ticket = em.getReference(Ticket, ticketId)
      await em.refresh(ticket)
      ticket.total_time += req.body.amount

      // Creo nueva entrada      
      req.body.newField = 'ticket'
      req.body.ticket = ticketId
      const time = em.create(DevotedTime, req.body);

      await em.flush()
  
      res
        .status(201)
        .json(time)
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)
      const ticketId = Number.parseInt(req.params.ticketId)
      
      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, ticketId, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para modificar la entrada.'
          })
          return
      }
      
      const id = Number.parseInt(req.params.id)
      const newAmount = req.body.amount
      
      // Actualizo cantidad total en el ticket
      if (newAmount) {
        const ticket = em.getReference(Ticket, ticketId)
        await em.refresh(ticket)
        const actualTimeEntry = await em.findOneOrFail(DevotedTime, id)
        ticket.total_time += (newAmount - actualTimeEntry.amount)
      }
      
      // Actualizo la entrada
      const time = em.getReference(DevotedTime, id)
      em.assign(time, req.body)
    
      await em.flush()

      res
        .status(200)
        .json({ message: 'Devoted time updated', data: time})
    }
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function remove(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)
      const ticketId = Number.parseInt(req.params.ticketId)
      
      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, ticketId, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para eliminar la entrada.'
          })
          return
      }
      
      const id = Number.parseInt(req.params.id)

      // Actualizo cantidad total en el ticket
      const timeEntry = await em.findOneOrFail(DevotedTime, id)
      const ticket = em.getReference(Ticket, ticketId)
      await em.refresh(ticket)
      ticket.total_time -= timeEntry.amount
      
      // Elimino la entrada      
      const time = em.getReference(DevotedTime, id)

      await em.removeAndFlush(time)

      res
        .status(200)
        .json({ message: 'Devoted time removed', data: time})
    }
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function noAdminValidation(userIsAdmin: boolean, ticketId: number, userId: number) {
  if (!userIsAdmin) {
    // Valido que el ticket exista
    await em.findOneOrFail(Ticket, { id: ticketId})

    // Valido que el usuario esté asignado al proyecto o al ticket
    const validationProject = await em.findOne(Project, { tickets: {id: ticketId}, users: {id: userId} })
    const validationTicket = await em.findOne(Ticket, { id: ticketId, responsible: {id: userId} })

    if (validationProject == undefined && validationTicket == undefined) { return true }

  }
}

export {sanitizeDevotedTimeInput, findAll, findAllFromUser, findTicketsDevotedTime, findOne, add, update, remove}
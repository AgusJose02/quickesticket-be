import { NextFunction, Request, Response } from "express";

import { entityManager } from '../shared/db/orm.js'
import { decodeToken } from "../token-decoder.js";
import { Ticket } from "./ticket.entity.js";
import { Project } from "../project/project.entity.js";


const em = entityManager;

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

    const token = req.headers.authorization
    
    if (token) {
      const { userId } = decodeToken(token)

      const tickets = await em.find(
        Ticket,
        { responsible: {id: userId}},
        { populate: ['project', 'state']}
      )
      
      res
        .status(200)
        .json(tickets)
    }

  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)
      const id = Number.parseInt(req.params.id)

      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, id, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para acceder al ticket.'
          })
          return
      }

      const ticket = await em.findOneOrFail(Ticket,
        { id },
        { populate: ['project', 'state', 'responsible', 'creator'],
          fields: [
            'project.name',
            'creator.username',
            'responsible.username',
            'beginning_date',
            'end_date',
            'state',
            'total_hours',
            'title',
            'description'
          ]
        }
      )
  
      res
        .status(200)
        .json(ticket)
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
      
      if (!userIsAdmin) {
        const projectId = req.body.project
        
        // Valido que el proyecto exista
        await em.findOneOrFail(Project, { id: projectId})
        
        // Valido que el usuario esté asignado al proyecto
        try {
          await em.findOneOrFail(Project, { id: projectId, users: {id: userId} })
        } catch (error: any) {
          res.status(403).json({
            message: 'No posee los permisos necesarios para crear el ticket.'
          })
          return
        }
      }

      const ticket = em.create(Ticket, req.body);
      delete ticket.id; //elimino el id que viene desde el front
      await em.flush()
      
      res
        .status(201)
        .json({ticket})
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
      const id = Number.parseInt(req.params.id)
      
      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, id, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para modificar el ticket.'
          })
          return
      }

      const ticket = em.getReference(Ticket, id)
      em.assign(ticket, req.body)
  
      await em.flush()
  
      res
        .status(200)
        .json({ message: 'Ticket updated', data: ticket})
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
      const id = Number.parseInt(req.params.id)
      
      // Validaciones para no admins
      if (await noAdminValidation(userIsAdmin, id, userId)) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para eliminar el ticket.'
          })
          return
      }

      const ticket = em.getReference(Ticket, id)
      await em.removeAndFlush(ticket)
  
      res
        .status(200)
        .json({ message: 'ticket removed', data: ticket})
    }

  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function noAdminValidation(userIsAdmin: boolean, ticketId: number, userId: number) {
  if (!userIsAdmin) {
    // Valido que el proyecto exista
    await em.findOneOrFail(Project, { tickets: {id: ticketId}})

    // Valido que el usuario esté asignado al proyecto o al ticket
    const validationProject = await em.findOne(Project, { tickets: {id: ticketId}, users: {id: userId} })
    const validationTicket = await em.findOne(Ticket, { id: ticketId, responsible: {id: userId} })

    if (validationProject == undefined && validationTicket == undefined) { return true }

  }
}

export { sanitizeTicketInput, findAll, findOne, add, update, remove }

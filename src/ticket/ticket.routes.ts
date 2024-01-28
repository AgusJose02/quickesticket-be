import { Router } from "express";
import { sanitizeTicketInput, findAll, findOne, add, update, remove  } from "./ticket.controler.js";

export const ticketRouter = Router()

/// GET ALL
ticketRouter.get('/', findAll)

/// GET ONE
ticketRouter.get('/:id', findOne)

/// POST
ticketRouter.post('/', sanitizeTicketInput, add)

/// PUT
ticketRouter.put('/:id', update) // TODO: INCLUIR SANITIZED

/// DELETE
ticketRouter.delete('/:id', remove) // TODO: INCLUIR SANITIZED
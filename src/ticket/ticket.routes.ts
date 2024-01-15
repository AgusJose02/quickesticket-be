import { Router } from "express";
import { findAll, findOne, add, update, remove  } from "./ticket.controler.js";

export const ticketRouter = Router()

/// GET ALL
ticketRouter.get('/', findAll)

/// GET ONE
ticketRouter.get('/:id', findOne)

/// POST
ticketRouter.post('/', add)

/// PUT
ticketRouter.put('/:id', update)

/// DELETE
ticketRouter.delete('/:id', remove)
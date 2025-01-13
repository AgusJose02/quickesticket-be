import { Router } from "express";
import { sanitizeTicketInput, findAll, findOne, add, update, remove  } from "./ticket.controler.js";
import { validateToken } from "../token-validation.js";

export const ticketRouter = Router()

/// GET ALL
ticketRouter.get(
  '/',
  validateToken,
  findAll
)

/// GET ONE
ticketRouter.get(
  '/:id',
  validateToken,
  findOne
)

/// POST
ticketRouter.post(
  '/',
  validateToken,
  sanitizeTicketInput,
  add
)

/// PUT
ticketRouter.put(
  '/:id',
  validateToken,
  update
) // TODO: INCLUIR SANITIZED

/// DELETE
ticketRouter.delete(
  '/:id',
  validateToken,
  remove

) // TODO: INCLUIR SANITIZED
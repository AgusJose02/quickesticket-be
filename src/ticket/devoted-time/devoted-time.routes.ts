import { Router } from "express";
import { sanitizeDevotedTimeInput, findAll, findTicketsDevotedTime, findOne, add, update, remove } from "./devoted-time.controler.js";
import { validateToken } from "../../token-validation.js";

export const devotedTimeRouter = Router()

/// GET ALL
devotedTimeRouter.get(
  '/',
  validateToken,
  findAll
)

// GET ALL FROM ONE TICKET
devotedTimeRouter.get(
  '/:ticketId/devoted-time/',
  validateToken,
  findTicketsDevotedTime
)

// GET ONE
devotedTimeRouter.get(
  '/:ticketId/devoted-time/:id',
  validateToken,
  findOne
)

// POST
devotedTimeRouter.post(
  '/:ticketId/devoted-time',
  validateToken,
  sanitizeDevotedTimeInput,
  add
)

// PUT
devotedTimeRouter.put('/:ticketId/devoted-time/:id',
  validateToken,
  update
)

// DELETE
devotedTimeRouter.delete(
  '/:ticketId/devoted-time/:id',
  validateToken,
  remove
)
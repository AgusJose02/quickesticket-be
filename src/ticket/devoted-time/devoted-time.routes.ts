import { Router } from "express";
import { sanitizeDevotedTimeInput, findAll, findTicketsDevotedTime, findOne, add, update, remove, findAllFromUser, findAllFromLastWeek } from "./devoted-time.controler.js";
import { validateToken } from "../../token-validation.js";

export const devotedTimeRouter = Router()

/// GET ALL
devotedTimeRouter.get(
  '/',
  validateToken,
  findAll
)

/// GET ALL
devotedTimeRouter.get(
  '/last-week',
  validateToken,
  findAllFromLastWeek
)

/// GET ALL
devotedTimeRouter.get(
  '/user/:id',
  validateToken,
  findAllFromUser
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
import { Router } from "express";
import { sanitizeDevotedTimeInput, findAll, findTicketsDevotedTime, findOne, add, update, remove } from "./devoted-time.controler.js";

export const devotedTimeRouter = Router()

/// GET ALL
devotedTimeRouter.get('/', findAll)

// GET ALL FROM ONE TICKET
devotedTimeRouter.get('/:ticketId/devoted-time/', findTicketsDevotedTime)

// GET ONE
devotedTimeRouter.get('/:ticketId/devoted-time/:id', findOne)

// POST
devotedTimeRouter.post('/:ticketId/devoted-time/', sanitizeDevotedTimeInput, add)

// PUT
devotedTimeRouter.put('/:ticketId/devoted-time/:id', update)

// DELETE
devotedTimeRouter.delete('/:ticketId/devoted-time/:id', remove)
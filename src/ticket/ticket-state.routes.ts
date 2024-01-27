import { Router } from "express";
import { findAll } from "./ticket-state.controler.js";

export const ticketStateRouter = Router()

/// GET ALL
ticketStateRouter.get('/', findAll)

/// GET ONE
// ticketRouter.get('/:id', findOne)
import { Router } from "express";
import { sanitizeProjectInput, findAll, findOne, add, update, remove  } from "./project.controler.js";
import { validateToken } from "../token-validation.js";

export const projectRouter = Router()

/// GET ALL
projectRouter.get('/', validateToken, findAll)

/// GET ONE
projectRouter.get('/:id',validateToken, findOne)

/// POST
projectRouter.post('/', sanitizeProjectInput, add)

/// PUT
projectRouter.put('/:id', sanitizeProjectInput, update)

/// PATCH
projectRouter.patch('/:id', sanitizeProjectInput, update)

/// DELETE
projectRouter.delete('/:id', remove)
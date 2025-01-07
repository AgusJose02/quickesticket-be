import { Router } from "express";
import { findAll, add, login } from './user.controler.js'

export const userRouter = Router()

/// GET ALL
userRouter.get('/', findAll)

/// POST REGISTER
userRouter.post('/', add)

/// POST LOGIN
userRouter.post('/login', login)
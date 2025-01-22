import { Router } from "express";
import { findAll, add, login, findOne, update, remove, getUserWorkTime } from './user.controler.js'
import { validateToken } from "../token-validation.js";

export const userRouter = Router()

/// GET ALL
userRouter.get(
  '/',
  validateToken,
  findAll
)

/// GET USER WORK TIME
userRouter.get(
  '/devoted-time',
  validateToken,
  getUserWorkTime
)

/// GET ONE
userRouter.get(
  '/:id',
  validateToken,
  findOne
)

/// POST REGISTER
userRouter.post(
  '/',
  validateToken,
  add
)

/// POST LOGIN
userRouter.post(
  '/login',
  login
)

/// PUT
userRouter.put(
  '/:id',
  update
)

/// DELETE
userRouter.delete(
  '/:id',
  validateToken,
  remove
)
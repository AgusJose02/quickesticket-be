import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { entityManager } from '../shared/db/orm.js'
import { User } from  './user.entity.js'


const em = entityManager;


async function findAll(req: Request, res: Response) {
  try {
    const users = await em.find(
      User,
      {},
      { populate: []}
    )

    res
      .status(200)
      .json(users)
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}


async function add(req: Request, res: Response) {

  const { username, password } = req.body
  
  // Validación de la no existencia del usuario
  const user = await em.findOne(User, { username: username })

  if (user) {
    return res.status(400).json({
      msg: `El usuario ${username} ya existe.`
    })
  }

  // Creación del usuario
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = em.create(User, req.body)

    user.password = hashedPassword

    await em.flush()

    res
      .status(201)
      .json(user)
    } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}


async function login(req: Request, res: Response) {
  
  const { username, password } = req.body
  
  //Validación de la existencia del usuario
  const user = await em.findOne(User, { username: username })

  if(!user) {
    return res.status(400).json({
      msg: `El usuario ${username} no existe.`
    })
  }

  //Validación de la password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  
  if(!isPasswordValid) {
    return res.status(400).json({
      msg: `Contraseña incorrecta.`
    })
  }

  //Generación del token
  const token = jwt.sign(
    {username: username},
    process.env.KEY || 'gael1222'
  )

  res.json(token)
}


export { findAll, add, login }
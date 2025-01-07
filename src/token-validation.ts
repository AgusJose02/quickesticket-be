import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']
  console.log(token)

  if(token != undefined) {

    try {
      jwt.verify(token, process.env.KEY || 'gael1222')
      next()
    } catch(error: any) {
      res.status(401).json({
        msg: 'Token inválido.'
      })
    }

  } else {
    res.status(401).json({
      msg: 'Acceso denegado'
    })
  }
}

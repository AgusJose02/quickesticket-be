import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { entityManager } from '../shared/db/orm.js'
import { User } from  './user.entity.js'
import { decodeToken } from '../token-decoder.js'


const em = entityManager;


async function login(req: Request, res: Response) {
  
  const { username, password } = req.body
  
  //Validación de la existencia del usuario
  const user = await em.findOne(User, { username: username })

  if(!user) {
    return res.status(400).json({
      message: `El usuario ${username} no existe.`
    })
  }

  //Validación de la password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  
  if(!isPasswordValid) {
    return res.status(400).json({
      message: `Contraseña incorrecta.`
    })
  }

  //Generación del token
  const token = jwt.sign(
    {
      id: user.id,
      username: username,
      isAdmin: user.is_admin
    },
    process.env.KEY || 'gael1222'
  )

  res.json(token)
}


async function findOne(req: Request, res: Response) {
  try {
    const token = req.headers.authorization
    
    if (token) {
      const { userIsAdmin } = decodeToken(token)
      const id = Number.parseInt(req.params.id)
      let user
      
      if (userIsAdmin) {
        // Caso para usuario admin
        user = await em.findOneOrFail(
          User,
          { id },
          { fields: ['id', 'username', 'is_admin']}
        )
        
      } else {
        // Caso para usuario no admin
        res.status(403).json({
          message: 'No posee los permisos necesarios para obtener el usuario.'
        })
        return
      }

      res
        .status(200)
        .json(user)
    }    
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}


async function findAll(req: Request, res: Response) {
  try {
    const users = await em.find(
      User,
      {},
      { populate: [],
        orderBy: {username: 'ASC'},
        fields: ['id', 'username']
      }
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
  const token = req.headers.authorization
  
  if (token) {
    const { userIsAdmin } = decodeToken(token)

    if (userIsAdmin) {
      const { username, password } = req.body
      
      // Validación de la no existencia del usuario
      const user = await em.findOne(User, { username: username })
    
      if (user) {
        return res.status(400).json({
          message: `El usuario ${username} ya existe.`
        })
      }
    
      // Creación del usuario
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = em.create(User, req.body)

        console.log(req.body)
    
        user.password = hashedPassword
        user.username = user.username.toLowerCase()
    
        await em.flush()
    
        res
          .status(201)
          .json(user)
        } catch(error: any) {
        res
          .status(500)
          .json({ message: error.message})
      }

    } else {
      res
          .status(403)
          .json('No posee los permisos necesarios para crear un usuario.')
    }
  }
  
}


async function update(req: Request, res: Response) {
  const token = req.headers.authorization
  
  if (token) {

    const { userIsAdmin } = decodeToken(token)     
    
    if (!userIsAdmin) {
      res.status(403).json({
        message: 'No posee los permisos necesarios para modificar el usuario.'
      })
      return
    }
    
    const id = Number.parseInt(req.params.id)
    const { username, password } = req.body
    
    // Validación de la no existencia del usuario
    const user = await em.findOne(User, { username: username })
    
    if (user) {
      return res.status(400).json({
        message: `El usuario ${username} ya existe.`
      })
    }

    try {

      const user = em.getReference(User, id)
      if (username) { req.body.username = username.toLowerCase() }
      if (password) { req.body.password = await bcrypt.hash(password, 10) }
      em.assign(user, req.body, {mergeObjects: true})
      
      await em.flush()
      
      res
        .status(200)
        .json({ message: 'User updated', data: user})

        
      } catch(error: any) {
        res
        .status(500)
        .json({ message: error.message})
      }
    }
}


async function remove(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userIsAdmin } = decodeToken(token)
      const id = Number.parseInt(req.params.id)
      
      // Validaciones para no admins
      if (!userIsAdmin) {
        res.status(403).json({
            message: 'No posee los permisos necesarios para eliminar el usuario.'
          })
          return
      }

      const user = em.getReference(User, id)
      await em.removeAndFlush(user)
  
      res
        .status(200)
        .json({ message: 'user removed', data: user})
    }

  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}


async function getUserWorkTime(req: Request, res: Response) {
  const token = req.headers.authorization
  
  if (token) {
    const { userIsAdmin } = decodeToken(token)

    if (userIsAdmin) {
      try {
        const { month, year } = req.query;
    
        if (!month || !year) {
          res
            .status(400)
            .json({ message: "Debe especificar mes y año." });
          return
        }
    
        // Valido mes y año
        const parsedMonth = parseInt(month as string);
        const parsedYear = parseInt(year as string);
        if (isNaN(parsedMonth) || isNaN(parsedYear) || parsedMonth < 1 || parsedMonth > 12) {
          return res.status(400).json({ message: "Mes o año inválido." });
        }
    
        const results = await em.getConnection()
          .execute(`
            SELECT u.id, u.username, 
              COALESCE(SUM(dt.amount), 0) AS total_time
            FROM user u
            LEFT JOIN devoted_time dt
              ON u.id = dt.user_id
              AND YEAR(dt.date) = ?
              AND MONTH(dt.date) = ?
            GROUP BY u.id, u.username
            ORDER BY u.username ASC
          `, [year, month]);
    
        res
          .status(200)
          .json(results);
      } catch(error: any) {
        res
          .status(500)
          .json({ message: error.message})
      }
    } else {
      res
        .status(403)
        .json('No posee los permisos necesarios para acceder.')
    }
  }

}

export { findOne, findAll, add, update, login, remove, getUserWorkTime }
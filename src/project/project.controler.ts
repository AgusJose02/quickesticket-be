import { NextFunction, Request, Response } from 'express'
import { entityManager } from '../shared/db/orm.js'

import { Project } from './project.entity.js'
import { decodeToken } from '../token-decoder.js';
import { User } from '../user/user.entity.js';


const em = entityManager;

/// SANITIZE INPUT

function sanitizeProjectInput(req: Request, res: Response, next: NextFunction){

  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    wiki: req.body.wiki,
    creation_date: req.body.creation_date
  }

  Object.keys(req.body.sanitizedInput).forEach(key =>{
    if(req.body.sanitizedInput[key] === undefined){
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const token = req.headers.authorization

    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)
      let projects = []

      if (userIsAdmin) {
        // Caso para usuario admin
        projects = await em.find(
          Project,
          {},
          { populate: []}
        )
      } else {
        // Caso para usuario no admin
        projects = await em.find(
          Project,
          { users: {id: userId}},
          { populate: []}
        )
      }
      
      res
        .status(200)
        .json(projects)

    }
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const token = req.headers.authorization
    let project
    
    if (token) {
      const { userId, userIsAdmin } = decodeToken(token)
      const id = Number.parseInt(req.params.id)
      await em.findOneOrFail(Project, { id }) // Valido que el proyecto exista
      
      if (userIsAdmin) {
        // Caso para usuario admin
        project = await em.findOneOrFail(
          Project,
          { id },
          { populate: ['tickets', 'tickets.state', 'tickets.responsible']}
        )
        
      } else {
        // Caso para usuario no admin
        project = await em.findOne(
          Project,
          { id, users: { id: userId } },
          { populate: ['tickets', 'tickets.state', 'tickets.responsible'] }
        );
        
        if (!project) {
          res.status(403).json({
            message: 'Acceso al proyecto denegado.'
          })
          return
        }
      }

      res
        .status(200)
        .json(project)
    }    
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const token = req.headers.authorization
    
    if (token) {
      const { userIsAdmin } = decodeToken(token)
      
      if (userIsAdmin) {
        const project = em.create(Project, req.body)
    
        delete project.id; //elimino el id que viene desde el front
    
        await em.flush()
    
        res
          .status(201)
          .json(project)
      } else {
        res.status(403).json({
          message: 'No posee los permisos necesarios para crear un proyecto.'
        })
      }

    }    
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const project = em.getReference(Project, id)

    em.assign(project, req.body)

    await em.flush()

    res
      .status(200)
      .json({ message: 'project updated', data: project})
        
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}

async function remove(req: Request, res: Response) {
  try {
    const token = req.headers.authorization
    
    if (token) {
      const { userIsAdmin } = decodeToken(token)
      const id = Number.parseInt(req.params.id)
      await em.findOneOrFail(Project, { id }) // Valido que el proyecto exista
      
      if (userIsAdmin) {
        const project = em.getReference(Project, id)
    
        await em.removeAndFlush(project)
    
        res
          .status(204)
          .json({ message: 'project removed', data: project})
        
      } else {
        res.status(403).json({
          message: 'No posee los permisos necesarios para eliminar un proyecto.'
        })
      }

    }
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}


async function findAssignedUsers(req: Request, res: Response) {
  try {
    const token = req.headers.authorization
    
    if (token) {
      const { userIsAdmin } = decodeToken(token)
      
      if (userIsAdmin) {
        const id = Number.parseInt(req.params.id)
        
        // Valido que exista el proyecto
        await em.findOneOrFail(Project, { id })

        const results = await em.getConnection()
          .execute(`
            SELECT u.id, u.username, 
              COALESCE(pu.project_id IS NOT NULL, false) AS assigned
            FROM user u
            LEFT JOIN project_users pu
              ON u.id = pu.user_id
              AND pu.project_id = ?
            ORDER BY u.username ASC
          `, [id]);

        res
          .status(200)
          .json(results)

      } else {
        res.status(403).json({
          message: 'No posee los permisos necesarios.'
        })
      }

    }
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}


async function addUserAssigment (req: Request, res: Response) {
  try {
    const token = req.headers.authorization
    
    if (token) {
      const { userIsAdmin } = decodeToken(token)
      
      if (userIsAdmin) {
        const id = Number.parseInt(req.params.id)
        const { userIds } = req.body

        console.log(req.body, userIds)
        
        // Valido que exista el proyecto
        const project = await em.findOneOrFail(Project, { id })
        const users = await em.find(User, { id: { $in: userIds } });

        if (users.length !== userIds.length) {
          res
            .status(400)
            .json({ message: 'Uno o más usuarios no existen.' });
          return
        }

        project.users.set(users)
        await em.flush()        

        res
          .status(200)
          .json({ message: 'Usuarios asignados correctamente.'})

      } else {
        res.status(403).json({
          message: 'No posee los permisos necesarios.'
        })
      }

    }
  } catch(error: any) {
    res
      .status(500)
      .json({ message: error.message})
  }
}


async function findProjectsDevotedTime(req: Request, res: Response) {
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
            SELECT p.id, p.name, p.hourly_rate,
              COALESCE(SUM(dt.client_time_amount), 0) AS total_time
            FROM project p
            LEFT JOIN ticket t
              ON p.id = t.project_id
            LEFT JOIN devoted_time dt
              ON t.id = dt.ticket_id
              AND YEAR(dt.date) = ?
              AND MONTH(dt.date) = ?
            GROUP BY p.id, p.name, p.hourly_rate
            ORDER BY p.name ASC
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


export { sanitizeProjectInput, findAll, findOne, add, update, remove, findAssignedUsers, addUserAssigment, findProjectsDevotedTime }

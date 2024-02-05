import { Request, Response } from "express";

import { entityManager } from '../../shared/db/orm.js'
import { TicketState } from "./ticket-state.entity.js";


const em = entityManager;


async function findAll(req: Request, res: Response) {
  try {
    const ticketStates = await em.find(
      TicketState,
      {}
    )

    res
      .status(200)
      .json(ticketStates)
  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

// async function findOne(req: Request, res: Response) {
//   try {
//     const id = Number.parseInt(req.params.id)
//     const ticket = await em.findOneOrFail(Ticket,
//       { id },
//       { populate: ['project', 'state']}
//     )

//     res
//       .status(200)
//       .json(ticket)
//   } catch(error: any) {
//     res
//       .status(500)
//       .json({ message: error.message})
//   }
// }

export { findAll }

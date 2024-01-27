import { Cascade, Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Ticket } from "./ticket.entity.js";

@Entity()
export class TicketState extends BaseEntity {
  @Property({nullable: false})
  description!: string

  @OneToMany(() => Ticket, (ticket) => ticket.state,
    { cascade: [Cascade.ALL] }
  )
    tickets= new Collection<Ticket>(this)
}
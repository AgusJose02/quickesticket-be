import { Cascade, Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Ticket } from "../ticket/ticket.entity.js";

@Entity()
export class Project extends BaseEntity {

  @Property({nullable: false, unique: true})
  name!: string

  @Property({nullable: true})
  description!: string

  @Property()
  wiki!: string

  @Property()
  creation_date!: string

  @OneToMany(() => Ticket, (ticket) => ticket.project,
    { cascade: [Cascade.ALL] }
  )
  tickets= new Collection<Ticket>(this)
}
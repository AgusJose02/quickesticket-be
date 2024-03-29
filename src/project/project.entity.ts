import { Cascade, Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Ticket } from "../ticket/ticket.entity.js";

@Entity()
export class Project extends BaseEntity {

  @Property({nullable: false, unique: true, columnType: 'varchar(25)'})
  name!: string

  @Property({nullable: true, columnType: 'varchar(75)'})
  description!: string

  @Property({nullable: true, columnType: 'text'})
  wiki!: string

  @Property({nullable: false, columnType: 'date'})
  creation_date!: Date

  @OneToMany(() => Ticket, (ticket) => ticket.project,
    { cascade: [Cascade.ALL] }
  )
  tickets= new Collection<Ticket>(this)
}
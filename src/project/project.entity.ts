import { Cascade, Collection, Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Ticket } from "../ticket/ticket.entity.js";
import { User } from "../user/user.entity.js";

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

  // Es una implementación básica. Lo ideal sería tener una tabla para poder ira actualizando los valores segun la fecha
  @Property({nullable: false, columnType: 'decimal(10, 2)'})
  hourly_rate!: number

  @OneToMany(() => Ticket, (ticket) => ticket.project,
    { cascade: [Cascade.ALL] }
  )
  tickets= new Collection<Ticket>(this)

  @ManyToMany(() => User, (user) => user.projects, { owner: true })
  users = new Collection<User>(this)
}
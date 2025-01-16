import { Collection, Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Project } from "../project/project.entity.js";
import { Ticket } from "../ticket/ticket.entity.js";
import { DevotedTime } from "../ticket/devoted-time/devoted-time.entity.js";

@Entity()
export class User extends BaseEntity {
  @Property({nullable: false, unique: true, columnType: 'varchar(45)'})
  username!: string

  @Property({nullable: false, columnType: 'varchar(255)'})
  password!: string
  
  @Property({nullable: false, columnType: 'tinyint'})
  is_admin!: number

  @ManyToMany(() => Project, (project) => project.users)
  projects = new Collection<Project>(this)

  @OneToMany(() => Ticket, (ticket) => ticket.creator)
  createdTickets = new Collection<Ticket>(this)

  @OneToMany(() => Ticket, (ticket) => ticket.responsible)
  assignedTickets = new Collection<Ticket>(this)

  @OneToMany(() => DevotedTime, (devotedTime) => devotedTime.user)
  devotedTimeEntries = new Collection<DevotedTime>(this)
}
import { Cascade, Collection, Entity, ManyToOne, OneToMany, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Project } from "../project/project.entity.js";
import { TicketState } from "./ticket-state/ticket-state.entity.js";
import { DevotedTime } from "./devoted-time/devoted-time.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class Ticket extends BaseEntity {
  @ManyToOne(() => Project, {nullable: false})
  project!: Rel<Project>

  @ManyToOne(() => User, {nullable: false})
  creator!: Rel<User>

  @ManyToOne(() => User, {nullable: true})
  responsible!: Rel<User>

  @Property({nullable: false, columnType: 'date'})
  beginning_date!: Date

  @Property({nullable: true, columnType: 'date'})
  end_date!: Date

  @ManyToOne(() => TicketState, {nullable: false})
  state!: Rel<TicketState>

  @Property({nullable: true})
  total_hours!: number

  @Property({nullable: false, columnType: 'varchar(75)'})
  title!: string

  @Property({nullable: true, columnType: 'text'})
  description!: string

  @OneToMany(() => DevotedTime, (devotedTime) => devotedTime.ticket,
    { cascade: [Cascade.ALL]}
  )
  devotedTimes= new Collection<DevotedTime>(this)
}
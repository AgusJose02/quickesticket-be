import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../../shared/base.entity.js";
import { Ticket } from "../ticket.entity.js";
import { User } from "../../user/user.entity.js";

@Entity()
export class DevotedTime extends BaseEntity {

  @ManyToOne(() => Ticket, { nullable: false, onDelete: 'cascade' })
  ticket!: Rel<Ticket>
  
  @Property({nullable: false, columnType: 'date'})
  date!: Date

  @Property({nullable: false, columnType: 'integer'})
  amount!: number

  @Property({nullable: true, columnType: 'varchar(75)'})
  description!: string

  @Property({nullable: true, columnType: 'integer'})
  client_time_amount!: number

  @ManyToOne(() => User, { nullable: false, onDelete: 'restrict' })
  user!: Rel<User>
}
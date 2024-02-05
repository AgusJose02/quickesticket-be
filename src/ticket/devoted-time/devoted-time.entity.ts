import { DecimalType, Entity, ManyToOne, PrimaryKeyType, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../../shared/base.entity.js";
import { Ticket } from "../ticket.entity.js";

@Entity()
export class DevotedTime extends BaseEntity {

  @ManyToOne(() => Ticket, { nullable: false })
  ticket!: Rel<Ticket>
  
  @Property({nullable: false, columnType: 'date'})
  date!: Date

  @Property({nullable: false, columnType: 'integer'}) //TODO: AVERIGUAR COMO MANEJAR DECIMALS PORQUE DEVUELVE STRINGS
  amount!: number

  @Property({nullable: true})
  description!: string

  @Property({nullable: true, columnType: 'integer'}) //TODO: AVERIGUAR COMO MANEJAR DECIMALS PORQUE DEVUELVE STRINGS
  client_time_amount!: number
}
import { DateType, Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Project } from "../project/project.entity.js";

@Entity()
export class Ticket extends BaseEntity {
  @ManyToOne(() => Project, {nullable: false})
  project!: Rel<Project>

  @Property()
  creator!: number

  @Property({nullable: true})
  responsible!: number

  @Property({nullable: false, columnType: 'date'})
  beginning_date!: string

  @Property({nullable: true, columnType: 'date'})
  end_date!: string

  @Property()
  state!: number

  @Property({nullable: true})
  total_hours!: number

  @Property({nullable: false})
  title!: string

  @Property({nullable: true})
  description!: string
}
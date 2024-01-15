import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";
import { Project } from "../project/project.entity.js";

@Entity()
export class Ticket extends BaseEntity {
  @ManyToOne(() => Project, {nullable: false})
  project!: Rel<Project>

  @Property()
  creator!: number

  @Property()
  responsible!: number

  @Property({nullable: false})
  beginning_date!: string

  @Property()
  end_date!: string

  @Property()
  state!: number

  @Property()
  total_hours!: number

  @Property({nullable: false})
  title!: string

  @Property()
  description!: string
}
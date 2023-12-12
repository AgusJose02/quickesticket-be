import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";

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

}
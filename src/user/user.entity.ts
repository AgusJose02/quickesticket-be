import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base.entity.js";

@Entity()
export class User extends BaseEntity {
  @Property({nullable: false, unique: true, columnType: 'varchar(45)'})
  username!: string

  @Property({nullable: false, columnType: 'varchar(255)'})
  password!: string
  
  @Property({nullable: false, columnType: 'tinyint'})
  is_admin!: number
}
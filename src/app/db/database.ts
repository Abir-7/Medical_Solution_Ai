import { DataSource } from "typeorm";
import { User } from "../modules/users/user/user.entity";
import { UserProfile } from "../modules/users/userProfile/userProfile.entity";

import { UserAuthentication } from "../modules/users/userAuthentication/user_authentication.entity";
import { appConfig } from "../config";
import { UserToken } from "../modules/userToken/userToken.entity";

export const myDataSource = new DataSource({
  type: appConfig.database.type as "postgres",
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  //password: "postgres", office
  database: appConfig.database.db_name,
  entities: [User, UserProfile, UserAuthentication, UserToken],
  //logging: true,
  synchronize: true,
});

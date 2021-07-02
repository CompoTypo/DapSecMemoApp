
import { _query } from "../services/_db";
import { retrieveForums } from "./Forum";

export async function checkUsername(uname): Promise<number> {
  try {
    let sql: string = "SELECT COUNT(*) FROM `user` WHERE `user_name` = ?;";
    let raw_res = await _query(sql, [uname]);
    let res = JSON.parse(JSON.stringify(raw_res));
    return res[0]['COUNT(*)'];
  } catch (e) {
    console.error(e);
  }
}

export async function createUser(user) {
  try {
    let sql: string = "INSERT INTO `user` (`user_name`,`email`,`hash`) " +
      "VALUES (?,?,?);";
    let raw_res = await _query(sql, [user.user_name, user.email, user.hash]);
    let res = JSON.parse(JSON.stringify(raw_res));
    return res;
  } catch (e) {
    console.error(e);
  }
}

export async function retrieveUser(uname) {
  try {
    let sql: string = "SELECT DISTINCT `id`,`user_name`,`email`,`hash` FROM `user` WHERE `user_name` LIKE ? LIMIT 1;";
    let values: string[] = [uname];
    let raw_res = await _query(sql, values);
    let res = JSON.parse(JSON.stringify(raw_res));
    return res[0];
  } catch (error) {
    console.error(error);
  }
}

export async function isForumAdmin(user_id, forum_id) {
  try {
    let sql: string = "SELECT COUNT(*) " +
      "FROM `membership` AS `m` " +
      "JOIN `rank` AS `r` " +
      "ON `r`.`id` = `m`.`rank_id` " +
      "WHERE `m`.`user_id` = ? AND `m`.`forum_id` = ? AND `r`.`rank_value` = 1;";
    let raw_res = await _query(sql, [user_id, forum_id]);
    let res = JSON.parse(JSON.stringify(raw_res));
    return res[0]['COUNT(*)']
  } catch (error) {
    
  }
}


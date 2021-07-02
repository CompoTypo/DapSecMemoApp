import { _query } from "../services/_db";

export async function createMembership(user_id, forum_id, rank_id) {
    try {
        let sql: string = "INSERT INTO `membership` " +
            "( `user_id`, `forum_id`, `rank_id` ) " +
            "VALUES ( ?, ?, ? );";
        let raw_res = await _query(sql, [user_id, forum_id, rank_id]);
        return raw_res;
    } catch (e) {
        console.error(e);
    }
}
export async function retrieveMembership(user_id: number) {
    try {
        let sql: string = "SELECT * FROM `membership` AS `m` " +
            "JOIN `forum` AS `f` " +
            "ON `m`.`forum_id` = `f`.`id` " +
            "WHERE `m`.`user_id` LIKE ?;";
        let raw_res = await _query(sql, [user_id.toString()]);
        //console.log(raw_res);
        return raw_res;
    } catch (e) {
        console.error(e);

    }
}

export async function retrieveForumUsers(forum_id) {
  try {
    let sql: string = "SELECT `u`.`user_name`, `r`.`rank_name`, `r`.`rank_value` " +
      "FROM `membership` AS `m` " +
      "JOIN `user` AS `u` " +
      "ON `m`.`user_id` = `u`.`id` " +
      "JOIN `rank` AS `r` " +
      "ON `m`.`rank_id` = `r`.`id` " +
      "WHERE `m`.`forum_id` = ? " +
      "ORDER BY `r`.`rank_value`;";
    let raw_res = await _query(sql, [forum_id]);
    console.log(raw_res)
    return JSON.parse(JSON.stringify(raw_res));
  } catch (error) {
    console.error(error);
  }
}

export async function updateMembership(rank_id, forum_id) {
    try {
        let sql: string = "UPDATE `membership` " +
            "SET `rank_id` = ? " +
            "WHERE `forum_id` = ?;";
        let raw_res = await _query(sql, [rank_id, forum_id]);
        console.log(raw_res);
    } catch (e) {
        console.error(e);
    }
}
async function deleteMembership() {
    try {

    } catch (e) {
        console.error(e);
    }
}

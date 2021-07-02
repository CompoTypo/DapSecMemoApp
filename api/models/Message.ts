import { _query } from "../services/_db";

export async function createMessage(user_id, page_id, text) {
    try {
        let sql: string = "INSERT INTO `message` " +
            "( `user_id`, `page_id`, `text` ) " +
            "VALUES ( ?, ?, ? );";
        let raw_res = await _query(sql, [user_id, page_id, text]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (error) {
        console.error(error);
    }
}

export async function retrieveMessages(page_id) {
    try {
        let sql: string = "SELECT `m`.`text`, `m`.`posted`, `u`.`user_name` " +
            "FROM `message` AS `m` " +
            "JOIN `user` AS `u` " +
            "ON `m`.`user_id` = `u`.`id` " +
            "WHERE `m`.`page_id` = ? " +
            "ORDER BY `m`.`posted`;";
        let raw_res = await _query(sql, [page_id]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (error) {
        console.error(error);
    }
}
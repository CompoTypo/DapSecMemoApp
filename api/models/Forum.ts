import { _query } from "../services/_db";

export async function createForum(forum_name: string, is_private: number) {
    try {
        let sql: string = "INSERT INTO `forum` " +
            "( `forum_name`, `is_private` ) " +
            "VALUES ( ?, ? );";
        let raw_res = await _query(sql, [forum_name, is_private.toString()]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (e) {
        console.error(e);
    }
}

export async function retrieveForums(user_id: number) {
    try {
        let sql: string = "SELECT `f`.`id`, `f`.`forum_name`, `f`.`is_private` " +
            "FROM `membership` AS `m` " +
            "JOIN `forum` AS `f` " +
            "ON `m`.`forum_id` = `f`.`id` " +
            "WHERE `m`.`user_id` = ?;";
        let raw_res = await _query(sql, [user_id]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (e) {
        console.error(e);

    }
}

export async function retrieveForumRankCount(forum_id: number) {
    try {
        let sql: string = "SELECT COUNT(DISTINCT `rank_name`) " +
            "FROM `rank` " +
            "WHERE `forum_id` = ?;";
        let raw_res = await _query(sql, [forum_id]);
        let res = JSON.parse(JSON.stringify(raw_res));
        return res[0]['COUNT(DISTINCT `rank_name`)'];
    } catch (error) {
        console.error(error);
    }
}

export async function updateForum(forum_id, forum_name, is_private) {
    try {
        let sql: string = "UPDATE `forum` " +
            "SET `forum_name` = ?, `is_private` = ? " +
            "WHERE `id` = ?;";
        let raw_res = await _query(sql, [forum_name, is_private, forum_id]);
    } catch (e) {
        console.error(e);
    }
}

export async function deleteForum(forum_id: number) {
    try {
        let sql: string = "DELETE FROM `forum` " +
            "WHERE `id` = ?;";
        let raw_res = await _query(sql, [forum_id]);
    } catch (e) {
        console.error(e);
    }
}

export async function checkForumName(forum_name: string) {
    let sql: string = "SELECT COUNT(*) FROM `forum` WHERE `forum_name` = ?;";
    let raw_res = await _query(sql, [forum_name]);
    let res = JSON.parse(JSON.stringify(raw_res));
    return res[0]['COUNT(*)'];
}

export async function findMatchingForums(forum_metadata: string) {
    let data;
    try {
        let sql: string = "SELECT `forum_name`, `id` " +
            "FROM `forum` WHERE `is_private` = 0 AND ";
        if (forum_metadata.match("[-+]?[0-9]*\\.?[0-9]+$")) {
            data = parseInt(forum_metadata);
            sql += "`id` = ?;";
        }
        else {
            data = '%' + forum_metadata + '%';
            sql += "`forum_name` LIKE ?;";
        }

        let raw_res = await _query(sql, [data])
        return JSON.parse(JSON.stringify(raw_res));
    } catch (e) {
        console.error(e);
    }
}

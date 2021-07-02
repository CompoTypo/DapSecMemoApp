import { _query } from "../services/_db";

export async function createRank(forum_id, rank, rank_value) {
    try {
        let sql: string =
            "INSERT INTO `rank` ( `forum_id`, `rank_name`, `rank_value` ) " +
            "VALUES ( (SELECT `id` FROM `forum` WHERE `id` = ?), ?, ? );";
        let raw_res = await _query(sql, [forum_id, rank, rank_value]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (error) {
        console.error(error);
    }

}

export async function retrieveRanks(forum_id: number) {
    try {
        let sql: string = "SELECT `id`, `rank_name`, `rank_value` " +
            "FROM `rank` " +
            "WHERE `forum_id` = ? " +
            "ORDER BY `rank_value`;";
        let raw_res = await _query(sql, [forum_id]);
        console.log(raw_res);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (error) {
        console.error(error);
    }
}

export async function retrieveRankByValue(forum_id, rank_value) {
    let sql: string = "SELECT DISTINCT * FROM `rank` " +
        "WHERE `forum_id` = ? AND `rank_value` = ?;"; 
    let raw_res = await _query(sql, [forum_id, rank_value]);
    return JSON.parse(JSON.stringify(raw_res));
}

export async function updateRank(forum_id, rank, rank_value) {
    try {
        let sql: string = "UPDATE `rank` " +
            "SET `rank_name` = ? " +
            "WHERE `forum_id` = ? AND `rank_value` = ?;";
        let raw_res = await _query(sql, [rank, forum_id, rank_value]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (error) {

    }
}
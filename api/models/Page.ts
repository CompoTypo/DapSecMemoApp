import { _query } from "../services/_db";

export async function createPage(forum_id, page_name, min_read_rank_id, min_write_rank_id) {
    try {
        let sql: string = "INSERT INTO `page` " +
            "( `forum_id`, `page_name`, `min_read_rank_id`, `min_write_rank_id` ) " +
            "VALUES ( ?, ?, ?, ? );";
        let raw_res = await _query(sql, [forum_id, page_name, min_read_rank_id, min_write_rank_id]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (e) {
        console.error(e);
    }
}

export async function retrievePages(forum_id: number) {
    try {
        let sql: string = "SELECT * FROM `page` " +
            "WHERE `forum_id` = ?;";
        let raw_res = await _query(sql, [forum_id]);
        return JSON.parse(JSON.stringify(raw_res));
    } catch (e) {
        console.error(e);

    }
}
export async function updatePage(page_id: number, min_read_rank_id: number, min_write_rank_id: number) {
    try {
        let sql: string = "UPDATE `page` " +
            "SET `min_read_rank_id` = ?, `min_write_rank_id` = ? " +
            "WHERE `id` = ?;";
        let raw_res = await _query(sql, [min_read_rank_id, min_write_rank_id, page_id]);
        return JSON.parse(JSON.stringify(raw_res));
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


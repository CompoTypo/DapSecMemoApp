import { Router } from "express";
const forum = Router();
import * as cors from "cors";
import { createForum, checkForumName, retrieveForums, retrieveForumRankCount, updateForum, deleteForum, findMatchingForums } from "../models/Forum";
import { createMembership, retrieveForumUsers, updateMembership } from "../models/Membership";
import { createMessage, retrieveMessages } from "../models/Message";
import { createPage, retrievePages, updatePage } from "../models/Page";
import { createRank, retrieveRanks, retrieveRankByValue, updateRank } from "../models/Rank";
import { isForumAdmin } from "../models/User";

import { authorize, authenticateToken } from "../services/auth";

forum.use(cors());
forum.post("/create", async (req, res) => {
    let token = req.headers['authorization'];
    let { forum_name, visibility } = req.body['forum'];
    if (!token) return res.status(400).send({ msg: "No Auth Token" });
    if (!forum_name) return res.status(400).send({ msg: "No forum name" });
    if (!visibility) return res.status(400).send({ msg: "No visibility set" });

    let is_private = visibility.toLowerCase().includes("pub") ? 0 : 1;
    try {
        let decoded_user = await authenticateToken(token);
        if (await checkForumName(forum_name) >= 1)
            return res.status(400).send({ msg: "Forum already exists" });
        let fc_res = await createForum(forum_name, is_private);
        let rc_res = await createRank(fc_res["insertId"], "admin", 1);
        console.log("New rank:" + rc_res.toString())
        await createMembership(decoded_user["id"], fc_res['insertId'], rc_res["insertId"]);
        decoded_user.forums = await retrieveForums(decoded_user['id']);
        for (let i = 0; i < decoded_user.forums.length; i++) {
            decoded_user.forums[i].is_admin = await isForumAdmin(decoded_user.id, decoded_user.forums[i].id);
        }
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (err) {
        return res.status(400).send(err);
    }
});

forum.post("/join/:fid", async (req, res) => {
    let token = req.headers['authorization'];
    let forum_id = parseInt(req.params['fid']);
    if (!token) return res.status(400).send({ msg: "No Auth Token" });
    if (!forum_id) return res.status(400).send({ msg: "No forum exists" });
    try {
        let decoded_user = await authenticateToken(token);

        let forum_ranks = await retrieveRanks(forum_id);
        if (forum_ranks.length <= 1) {
            let cr_res = await createRank(forum_id, 'user', forum_ranks.length + 1);
            await createMembership(decoded_user["id"], forum_id, cr_res['insertId']);
        } else
            await createMembership(decoded_user["id"], forum_id, forum_ranks[forum_ranks.length - 1].id);

        decoded_user.forums = await retrieveForums(decoded_user['id']);
        for (let i = 0; i < decoded_user.forums.length; i++) {
            decoded_user.forums[i].is_admin = await isForumAdmin(decoded_user.id, decoded_user.forums[i].id);
        }
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (err) {
        return res.status(400).send(err);
    }
});

forum.post("/search", async (req, res) => {
    let forum_metadata = req.body['metadata'];
    console.log(req.body);
    if (!forum_metadata || forum_metadata === '')
        return res.status(204).send("No data sent");

    try {
        let fc_res = await findMatchingForums(forum_metadata);
        console.log(fc_res)
        return res.status(200).send({ searched_forums: fc_res });
    } catch (err) {
        return res.status(400).send(err);
    }
});

forum.get("/:id", async (req, res) => {
    let forum_id = parseInt(req.params['id']);
    let token = req.headers['authorization'];

    try {
        let decoded_user = await authenticateToken(token);
        // if user is not a member, no forum index exists
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);
        console.log("Forum index:" + forum_index)

        decoded_user.forums[forum_index]['pages'] = await retrievePages(forum_id);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.post("/:id/delete", async (req, res) => {
    let forum_id = parseInt(req.params['id']);
    let token = req.headers['authorization'];

    try {
        let decoded_user = await authenticateToken(token);
        // if user is not a member, no forum index exists
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);
        let user_id: number = decoded_user.id;
        if (decoded_user.forums[forum_index].is_admin)
            await deleteForum(forum_id);

        decoded_user.forums = await retrieveForums(user_id);
        console.log(decoded_user.forums)
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.post("/:id/edit", async (req, res) => {
    let forum_id = parseInt(req.params['id']);
    let token = req.headers['authorization'];
    let { forum_name, visibility } = req.body['forum'];
    if (!token) return res.status(400).send({ msg: "No Auth Token" });
    if (!forum_name) return res.status(400).send({ msg: "No forum name" });
    if (!visibility) return res.status(400).send({ msg: "No visibility set" });

    let is_private = visibility.toLowerCase().includes("pub") ? 0 : 1;
    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);
        if (!decoded_user.forums[forum_index].is_admin)
            return res.status(400).send({msg: 'Not a forum admin'});

        await updateForum(forum_id, forum_name, is_private)
        decoded_user.forums = await retrieveForums(decoded_user.id);
        for (let i = 0; i < decoded_user.forums.length; i++) {
            decoded_user.forums[i].is_admin = await isForumAdmin(decoded_user.id, decoded_user.forums[i].id);
        }
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.get("/:id/ranks", async (req, res) => {
    let forum_id = parseInt(req.params['id']);
    let token = req.headers['authorization'];

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);

        decoded_user.forums[forum_index]['ranks'] = await retrieveRanks(forum_id);
        console.log(decoded_user.forums[forum_index]['ranks']);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.post("/:id/ranks/edit", async (req, res) => {
    let forum_id = parseInt(req.params['id']);
    let token = req.headers['authorization'];
    let { ranks } = req.body;

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);

        let num_forum_ranks: number = await retrieveForumRankCount(forum_id);
        console.log(num_forum_ranks);
        for (let i = 0; i < ranks.length; i++) {
            if (i < num_forum_ranks) {
                let raw_res = await updateRank(forum_id, ranks[i].rank_name, ranks[i].rank_value);
                console.log(raw_res);
            }
            else {
                let raw_res = await createRank(forum_id, ranks[i].rank_name, ranks[i].rank_value);
                if (i === ranks.length - 1) { // set all null forum ranks to least rank
                    await updateMembership(raw_res['insertId'], forum_id)
                }
            }
        }
        decoded_user.forums[forum_index]['ranks'] = await retrieveRanks(forum_id);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.get("/:id/users", async (req, res) => {
    let forum_id = parseInt(req.params['id']);
    let token = req.headers['authorization'];

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);

        decoded_user.forums[forum_index]['users'] = await retrieveForumUsers(forum_id);
        console.log(decoded_user.forums[forum_index]['users']);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.post("/:fid/users/:uid/promote", async (req, res) => {
    let forum_id = parseInt(req.params['fid']);
    let user_id = parseInt(req.params['uid']);
    let token = req.headers['authorization'];

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);
        let user_index: number = decoded_user.forums[forum_index].users.findIndex(u => u.id === user_id);
        let next_rank = await retrieveRankByValue(forum_id, decoded_user.forums[forum_index].users[user_index].rank_value - 1);
        console.log(next_rank)
        await updateMembership(next_rank['id'], forum_id);
        decoded_user.forums[forum_index]['users'] = await retrieveForumUsers(forum_id);
        console.log(decoded_user.forums[forum_index]['users']);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.post("/:id/page/create", async (req, res) => {
    let forum_id = parseInt(req.params['id']);
    let token = req.headers['authorization'];
    let { page } = req.body;

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);

        await createPage(forum_id, page['page_name'], parseInt(page['viewership']), parseInt(page['authorship']));
        decoded_user.forums[forum_index]['pages'] = await retrievePages(forum_id);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

// Get page messages
forum.get("/:fid/page/:pid", async (req, res) => {
    let forum_id = parseInt(req.params['fid']);
    let page_id = parseInt(req.params['pid']);
    let token = req.headers['authorization'];

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);
        let page_index: number = decoded_user.forums[forum_index]['pages'].findIndex(p => p.id === page_id);

        decoded_user.forums[forum_index]['pages'][page_index]['messages'] = await retrieveMessages(page_id);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

// edit page
forum.post("/:fid/page/:pid/edit", async (req, res) => {
    let forum_id = parseInt(req.params['fid']);
    let page_id = parseInt(req.params['pid']);
    let token = req.headers['authorization'];
    let { min_read_rank_id, min_write_rank_id } = req.body;

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);
        let page_index: number = decoded_user.forums[forum_index]['pages'].findIndex(p => p.id === page_id);

        decoded_user.forums[forum_index]['pages'][page_index]['messages'] = await updatePage(page_id, min_read_rank_id, min_write_rank_id);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

forum.post("/:fid/page/:pid/message", async (req, res) => {
    let forum_id = parseInt(req.params['fid']);
    let page_id = parseInt(req.params['pid']);
    let token = req.headers['authorization'];
    let { message } = req.body;

    try {
        let decoded_user = await authenticateToken(token);
        let forum_index: number = decoded_user.forums.findIndex(p => p.id === forum_id);
        let page_index: number = decoded_user.forums[forum_index]['pages'].findIndex(p => p.id === page_id);

        createMessage(message.user_id, page_id, message.text);
        decoded_user.forums[forum_index]['pages'][page_index]['messages'] = await retrieveMessages(page_id);
        token = await authorize(decoded_user);
        return res.status(200).send({ token: token });
    } catch (error) {
        console.error(error);
    }
})

module.exports = forum;

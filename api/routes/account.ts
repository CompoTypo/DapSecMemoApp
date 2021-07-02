import { Router } from "express";
const account = Router();
import * as cors from "cors";
import { hashSync } from "bcrypt";
import { authenticateCredentials, authorize } from "../services/auth";
import { checkUsername, createUser, isForumAdmin } from "../models/User";
import { retrieveForums } from "../models/Forum";

account.use(cors());

account.post("/register", async (req, res) => {
  let { user_name, email, password, password2 } = req.body;
  if (!user_name)
    return res.status(400).send({ msg: "No username" });
  else if (!email)
    return res.status(400).send({ msg: "No username" });
  else if (!password || password !== password2)
    return res.status(400).send({ msg: "Missmatched passwords" });

  try {
    if (await checkUsername(user_name) >= 1)
      return res.status(400).send({ msg: "Account already exists" });

    let hashed_pw = hashSync(password, 10);
    console.log("hash cp")
    let raw_user = { user_name: user_name, email: email, hash: hashed_pw };
    let u = await createUser(raw_user);
    return res.status(200).send({ account: JSON.stringify(u) }); //.dataValues.username + ' created.');
  } catch (err) {
    return res.status(400).send(err);
  }
});

account.post("/login", async (req, res) => {
  const { user_name, password } = req.body;
  if (!user_name || !password)
    return res.status(400).send('Request missing username or password param');

  try {
    let user = await authenticateCredentials(user_name, password);
    user.forums = await retrieveForums(user.id);
    for (let i = 0; i < user.forums.length; i++) {
      user.forums[i].is_admin = await isForumAdmin(user.id, user.forums[i].id);
      
    }
    let token = await authorize(user);
    return res.status(200).send({ token: token });
  } catch (err) {
    return res.status(400).send({ msg: 'invalid username or password' });
  }
});

//account.delete('/logout', async (req, res) => {
//  const { data, cookies: { account_token: accountToken } } = req
//
//  if (user && accountToken) {
//    await req.user.logout(accountToken);
//    return res.status(204).send()
//  }
//
//  return res.status(400).send(
//    { errors: [{ message: 'not accountenticated' }] }
//  );
//});

module.exports = account;
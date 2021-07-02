import { compareSync } from "bcrypt";
import { verify, sign } from "jsonwebtoken";
import { retrieveUser } from "../models/User";

export async function authenticateToken(token: string) {
    console.log("Authenticating Token");
    return JSON.parse(JSON.stringify(verify(token, process.env.TOKEN_SECRET)))['data'];
};

export async function authenticateCredentials(usercred: string, password: string) {
    console.log("Authenticating Credentials");
    let user = await retrieveUser(usercred);

    if (user && compareSync(password, user.hash)) {
        return user;
    }
    throw new Error("invalid password");
};

export async function authorize(user): Promise<string> {
    console.log("Authorizing");
    return sign(
        { data: user },
        process.env.TOKEN_SECRET,
        {
            issuer: "DAPSEC",
            subject: user.user_name,
            audience: "site-url",
            expiresIn: "30m",
            algorithm: "HS256", // SHA
        }
    );
};
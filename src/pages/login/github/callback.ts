import { github, lucia } from "../../../lib/auth";
import { OAuth2RequestError } from "arctic";
import { db } from "../../../lib/db";
import { generateId } from "lucia";

import type { APIContext } from "astro";
import type { DatabaseUser } from "../../../lib/db";

export async function GET(context: APIContext): Promise<Response> {
    const code = context.url.searchParams.get("code");
    const state = context.url.searchParams.get("state");
    const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }

    try {
        const tokensData = await github.validateAuthorizationCode(code);
        const token = JSON.parse(JSON.stringify(tokensData.data));

        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });
        
        const githubUser: GitHubUser = await githubUserResponse.json();
        const existingUser = db.prepare("SELECT * FROM user WHERE github_id = ?").get(githubUser.id) as
            | DatabaseUser
            | undefined;

        if (existingUser) {
            const session = await lucia.createSession(existingUser.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            return context.redirect("/");
        }

        const userId = generateId(15);
        db.prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)").run(
            userId,
            githubUser.id,
            githubUser.login
        );
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return context.redirect("/");
    } catch (e) {
        if (e instanceof OAuth2RequestError) {
            if (e.message === "bad_verification_code") {
                return new Response("Código de verificación incorrecto", {
                    status: 400
                });
            }
            return new Response("Error de autorización de GitHub", {
                status: 500
            });
        }
        return new Response("Error interno del servidor", {
            status: 500
        });
    }
}

interface GitHubUser {
    id: string;
    login: string;
}
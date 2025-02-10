import { generateState } from "arctic";
import { github } from "../../../lib/auth";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
	const state = generateState();
	const url = github.createAuthorizationURL(state, ['user']);

	context.cookies.set("github_oauth_state", state, {
		path: "/",
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	return context.redirect(url.toString());
}
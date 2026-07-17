declare namespace App {
	interface Locals {
		session: import("lucia").Session | null;
		user: import("lucia").User | null;
	}
}

declare module "swiper/css";
declare module "swiper/css/*";
import { Guard } from "../common";
import { OnDestroy } from "./on-destroy";

export const isOnDestroy: Guard<OnDestroy> = (x: unknown): x is OnDestroy => {
	return typeof x["onDestroy"] === "function";
};
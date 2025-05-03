import { Guard } from "../utils";
import { OnDestroy } from "./on-destroy.interface";

export const isOnDestroy: Guard<OnDestroy> = (x: unknown): x is OnDestroy => {
	return typeof x["onDestroy"] === "function";
};
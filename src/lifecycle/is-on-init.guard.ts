import { Guard } from "../utils";
import { OnInit } from "./on-init.interface";

export const isOnInit: Guard<OnInit> = (x: unknown): x is OnInit => {
	return typeof x["onInit"] === "function";
};

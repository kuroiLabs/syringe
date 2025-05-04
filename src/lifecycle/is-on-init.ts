import { Guard } from "../common";
import { OnInit } from "./on-init";

export const isOnInit: Guard<OnInit> = (x: unknown): x is OnInit => {
	return typeof x["onInit"] === "function";
};

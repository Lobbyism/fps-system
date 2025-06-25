import { System, World } from "@rbxts/matter";
import { useApplication } from "client/hooks/useApplication";
const system: System<[World]> = (world) => {
	useApplication(world);
};
export = system;

import { System, World } from "@rbxts/matter";
import { ClientState } from "client/client.client";
import { useApplication } from "client/hooks/useApplication";
const system: System<[World, ClientState]> = (world, state) => {
	useApplication(world, state);
};
export = system;

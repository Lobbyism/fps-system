import { System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { Player } from "shared";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, playerRecord] of world.queryChanged(Player)) {
		if (!world.contains(id)) continue;
		if (!playerRecord.new) continue;
		if (playerRecord.new.player !== Players.LocalPlayer) continue;
		playerRecord.new.player.CameraMode = state.cameraMode;
	}
};
export = system;

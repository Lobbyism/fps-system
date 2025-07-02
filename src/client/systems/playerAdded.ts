import { System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { Camera, Player } from "shared";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, playerRecord] of world.queryChanged(Player)) {
		if (!world.contains(id)) continue;
		if (!playerRecord.new || playerRecord.old) continue;
		if (playerRecord.new.player !== Players.LocalPlayer) continue;
		world.insert(
			id,
			Camera({
				cameraMode:
					state.preferredInput === Enum.PreferredInput.KeyboardAndMouse ? "FirstPerson" : "ThirdPerson",
			}),
		);
	}
};
export = system;

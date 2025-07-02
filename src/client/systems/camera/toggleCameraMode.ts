import { System, useEvent, World } from "@rbxts/matter";
import { Players, UserInputService } from "@rbxts/services";
import { Camera, Player } from "shared";
const system: System<[World]> = (world) => {
	for (const [id, player, camera] of world.query(Player, Camera)) {
		if (player.player !== Players.LocalPlayer) continue;
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, UserInputService.InputBegan)) {
			if (gameProcessedEvent) continue;
			if (input.KeyCode !== Enum.KeyCode.T) continue;
			world.insert(
				id,
				camera.patch({
					cameraMode: camera.cameraMode === "FirstPerson" ? "ThirdPerson" : "FirstPerson",
				}),
			);
		}
	}
};
export = system;

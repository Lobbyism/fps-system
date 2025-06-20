import { System, useEvent, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { Player } from "shared/components";
let firstRunSystem = true;
const system: System<[World]> = (world) => {
	const playerAdded = (player: Player) => {
		world.spawn(Player({ player: player }));
	};
	if (!firstRunSystem) {
		firstRunSystem = false;
		Players.GetPlayers().forEach(playerAdded);
	}
	for (const [_, player] of useEvent(Players, "PlayerAdded")) {
		playerAdded(player);
	}
};
export = system;

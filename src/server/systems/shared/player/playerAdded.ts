import { System, useEvent, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { Player } from "shared/components";
let firstRunSystem = false;
const system: System<[World]> = (world: World) => {
	const playerAdded = (player: Player) => {
		print(world.spawn(Player({ player: player })));
	};
	if (!firstRunSystem) {
		firstRunSystem = true;
		Players.GetPlayers().forEach(playerAdded);
	}
	for (const [_, player] of useEvent(Players, "PlayerAdded")) {
		playerAdded(player);
	}
};
export = system;

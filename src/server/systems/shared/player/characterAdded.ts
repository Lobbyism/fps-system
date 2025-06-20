import { AnyEntity, System, useEvent, World } from "@rbxts/matter";
import { Model, Player } from "shared/components";
let firstRunSystem = true;
const system: System<[World]> = (world) => {
	const characterAdded = (playerId: AnyEntity, character: Model) => {
		world.insert(playerId, Model({ model: character }));
	};
	for (const [id, player] of world.query(Player)) {
		for (const [_, character] of useEvent(player.player, "CharacterAdded")) {
			characterAdded(id, character);
		}
	}
	if (firstRunSystem) {
		firstRunSystem = false;
		for (const [id, player] of world.query(Player).without(Model)) {
			if (!player.player.Character) continue;
			characterAdded(id, player.player.Character);
		}
	}
};
export = system;

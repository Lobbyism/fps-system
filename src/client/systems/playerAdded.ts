import { System, World } from "@rbxts/matter";
import { Player } from "shared/components";
const system: System<[World]> = (world: World) => {
	for (const [id, playerRecord] of world.queryChanged(Player)) {
		print(id, playerRecord);
	}
};
export = system;

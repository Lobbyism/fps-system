import { System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { Model, Movement, Player } from "shared";
import { MovementState } from "shared/weapons";
const system: System<[World]> = (world) => {
	for (const [id, _] of world.queryChanged(Model)) {
		if (!world.contains(id)) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		world.insert(
			id,
			Movement({
				state: MovementState.Idle,
			}),
		);
	}
};
export = system;

import { System, World } from "@rbxts/matter";
import { ServerStorage } from "@rbxts/services";
import { HasWeapon, Model, Player, Weapon } from "shared";

const system: System<[World]> = (world) => {
	for (const [id, characterRecord] of world.queryChanged(Model)) {
		if (!world.contains(id)) continue;
		if (!characterRecord.new) continue;
		if (!world.get(id, Player)) continue;
		const hasWeapon = world.get(id, HasWeapon);
		if (hasWeapon && world.contains(hasWeapon.serverId)) {
			const weaponModel = world.get(hasWeapon.serverId, Model);
			if (weaponModel) weaponModel.model.Destroy();
			world.despawn(hasWeapon.serverId);
		}
		const assaultRifle = ServerStorage.FindFirstChild("AssaultRifle")?.Clone();
		if (!assaultRifle || !assaultRifle.IsA("Model")) continue;
		assaultRifle.Parent = characterRecord.new.model;
		world.insert(
			id,
			HasWeapon({
				serverId: world.spawn(
					Weapon({}),
					Model({
						model: assaultRifle,
					}),
				),
			}),
		);
	}
};
export = system;

import { System, World } from "@rbxts/matter";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { HasWeapon, Model, Player, Weapon } from "shared";
const system: System<[World]> = (world) => {
	for (const [id, characterRecord] of world.queryChanged(Model)) {
		if (!world.contains(id)) continue;
		if (!characterRecord.new) continue;
		const player = world.get(id, Player);
		if (!player) continue;
		const hasWeapon = world.get(id, HasWeapon);
		if (hasWeapon && world.contains(hasWeapon.serverId)) {
			const weaponModel = world.get(hasWeapon.serverId, Model);
			if (weaponModel) weaponModel.model.Destroy();
			world.despawn(hasWeapon.serverId);
		}
		const weaponModel = ReplicatedStorage.FindFirstChild("Weapons")?.FindFirstChild("M16A4")?.Clone();
		if (!weaponModel || !weaponModel.IsA("Model")) continue;
		weaponModel.Parent = characterRecord.new.model;
		if (weaponModel.IsDescendantOf(Workspace)) {
			weaponModel.GetDescendants().forEach((instance) => {
				if (!instance.IsA("BasePart")) return;
				instance.SetNetworkOwner(player.player);
			});
		}
		if (weaponModel.PrimaryPart) {
			weaponModel.PrimaryPart.Anchored = true;
		}
		world.insert(
			id,
			HasWeapon({
				serverId: world.spawn(
					Weapon({
						name: weaponModel.Name,
						isShooting: false,
					}),
					Model({
						model: weaponModel,
					}),
				),
			}),
		);
	}
};
export = system;

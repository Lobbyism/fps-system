import { System, World } from "@rbxts/matter";
import { Players, ReplicatedStorage } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player, ViewModel, Weapon } from "shared";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const [player, playerModel] = world.get(id, Player, Model);
		if (!player || player.player !== Players.LocalPlayer || !playerModel) continue;
		if (hasWeaponRecord.new && hasWeaponRecord.old?.serverId === hasWeaponRecord.new.serverId) continue;
		world.remove(id, ViewModel);
		if (!hasWeaponRecord.new) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeaponRecord.new.serverId));
		if (!weaponId) continue;
		const weapon = world.get(weaponId, Weapon);
		if (!weapon) continue;
		const viewModel = ReplicatedStorage.FindFirstChild("ViewModels")?.FindFirstChild(weapon.name)?.Clone();
		if (!viewModel || !viewModel.IsA("Model")) continue;
		viewModel.Parent = playerModel.model;
		world.insert(
			id,
			ViewModel({
				isAimingDownSights: false,
				model: viewModel,
			}),
		);
	}
};
export = system;

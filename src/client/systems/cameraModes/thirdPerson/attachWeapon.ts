import { System, useEvent, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player, Weapon } from "shared";
const attachWeaponToRightHand = (playerModel: Model, weaponModel: Model) => {
	if (!weaponModel.PrimaryPart) return;
	const rightHand = playerModel.FindFirstChild("RightHand");
	if (!rightHand || !rightHand.IsA("BasePart")) return;
	const motor6D = new Instance("Motor6D");
	motor6D.Part0 = rightHand;
	motor6D.Part1 = weaponModel.PrimaryPart;
	motor6D.Parent = motor6D.Part1;
	weaponModel.PrimaryPart.Anchored = false;
};
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		if (!hasWeaponRecord.new) continue;
		if (hasWeaponRecord.old) continue;
		const [player, playerModel] = world.get(id, Player, Model);
		if (!player || !playerModel || player.player !== Players.LocalPlayer) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeaponRecord.new.serverId));
		if (!weaponId) continue;
		const [weapon, weaponModel] = world.get(weaponId, Weapon, Model);
		if (!weapon || !weaponModel) continue;
		attachWeaponToRightHand(playerModel.model, weaponModel.model);
	}
	for (const [weaponId, , weaponModel] of world.query(Weapon, Model)) {
		for (const [] of useEvent(weaponModel.model, weaponModel.model.GetPropertyChangedSignal("PrimaryPart"))) {
			for (const [_, player, playerModel, hasWeapon] of world.query(Player, Model, HasWeapon)) {
				if (player.player !== Players.LocalPlayer) continue;
				if (state.entityIdMap.get(tostring(hasWeapon.serverId)) !== weaponId) continue;
				attachWeaponToRightHand(playerModel.model, weaponModel.model);
			}
		}
	}
};
export = system;

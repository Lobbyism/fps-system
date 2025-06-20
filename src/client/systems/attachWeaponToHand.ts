import { System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player } from "shared";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const [player, playerModel] = world.get(id, Player, Model);
		if (!player || !playerModel || player.player !== Players.LocalPlayer) continue;
		if (!hasWeaponRecord.new) continue;
		if (!state.entityIdMap.get(tostring(hasWeaponRecord.new.serverId))) continue;
		const weaponModel = world.get(hasWeaponRecord.new.serverId, Model);
		if (!weaponModel) continue;
		let characterRightHand = playerModel.model.FindFirstChild("RightHand");
		if (!characterRightHand?.IsA("BasePart")) {
			characterRightHand = undefined;
		}
		const motor6D = new Instance("Motor6D");
		motor6D.Part0 = characterRightHand;
		motor6D.Part1 = weaponModel.model.PrimaryPart;
		motor6D.Parent = motor6D.Part1;
		if (weaponModel.model.PrimaryPart) {
			weaponModel.model.PrimaryPart.Anchored = false;
		}
	}
};
export = system;

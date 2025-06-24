import { System, useThrottle, World } from "@rbxts/matter";
import { Debris, Players, ReplicatedStorage, UserInputService } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player, ViewModel, Weapon } from "shared";
const system: System<[World, ClientState]> = (world, state) => {
	if (UserInputService.PreferredInput !== Enum.PreferredInput.KeyboardAndMouse) return;
	for (const [weaponId, weaponRecord] of world.queryChanged(Weapon)) {
		if (!world.contains(weaponId)) continue;
		if (!weaponRecord.old || !weaponRecord.new) continue;
		if (weaponRecord.old.isShooting === weaponRecord.new.isShooting) continue;
		for (const [playerId, player, hasWeapon] of world.query(Player, HasWeapon)) {
			if (player.player !== Players.LocalPlayer) continue;
			if (state.entityIdMap.get(tostring(hasWeapon.serverId)) !== weaponId) continue;
			const weaponViewModel = world.get(playerId, ViewModel);
			if (!weaponViewModel) continue;
			const muzzleOriginAttachment = weaponViewModel.model.FindFirstChild("MuzzleOrigin", true);
			if (!muzzleOriginAttachment) continue;
			if (weaponRecord.new.isShooting) {
				ReplicatedStorage.FindFirstChild("MuzzleFlash")
					?.FindFirstChild("Attachment")
					?.GetChildren()
					.forEach((instance) => {
						const clonedInstance = instance.Clone();
						clonedInstance.Parent = muzzleOriginAttachment;
					});
			} else {
				muzzleOriginAttachment.GetDescendants().forEach((instance) => instance.Destroy());
			}
		}
	}
	for (const [_, player, hasWeapon, viewModel] of world.query(Player, HasWeapon, ViewModel)) {
		if (player.player !== Players.LocalPlayer) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
		if (!weaponId) continue;
		const [weapon, weaponModel] = world.get(weaponId, Weapon, Model);
		if (!weapon || !weaponModel) continue;
		if (!weapon.isShooting) continue;
		if (!useThrottle(0.1)) continue;
		const firingSound = weaponModel.model.FindFirstChild("FiringSound")?.Clone();
		if (!firingSound || !firingSound.IsA("Sound")) continue;
		firingSound.Play();
		firingSound.Name = "FiringSoundInstance";
		firingSound.Parent = weaponModel.model;
		firingSound.Play();
		firingSound.Ended.Once(() => {
			firingSound.Destroy();
		});
		Debris.AddItem(firingSound, 5);
	}
};
export = system;

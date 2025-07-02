import { System, useThrottle, World } from "@rbxts/matter";
import { Debris, Players, ReplicatedStorage } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { Camera, HasWeapon, Model, Player, ViewModel, Weapon } from "shared";
import { Weapons, WeaponUsageState } from "shared/weapons";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [hasWeaponId, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(hasWeaponId)) continue;
		if (!hasWeaponRecord.old || !hasWeaponRecord.new) continue;
		if (hasWeaponRecord.old.state === hasWeaponRecord.new.state) continue;
		const [player, playerCamera, playerViewModel] = world.get(hasWeaponId, Player, Camera, ViewModel);
		if (!player || !playerCamera || !playerViewModel) continue;
		if (player.player !== Players.LocalPlayer) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeaponRecord.new.serverId));
		if (!weaponId) continue;
		const [weapon, weaponModel] = world.get(weaponId, Weapon, Model);
		if (!weapon || !weaponModel) continue;
		const weaponInfo = Weapons.get(weapon.name);
		const selectedWeaponModel = playerCamera.cameraMode === "FirstPerson" ? playerViewModel : weaponModel;
		if (!weaponInfo) continue;
		const hasWeapon = hasWeaponRecord.new;
		const muzzleOriginAttachment = selectedWeaponModel.model.FindFirstChild("MuzzleOrigin", true);
		if (!muzzleOriginAttachment) return;
		if (hasWeapon.state === WeaponUsageState.Shooting) {
			ReplicatedStorage.FindFirstChild("MuzzleFlash")
				?.FindFirstChild("Attachment")
				?.GetChildren()
				.forEach((instance) => {
					const clonedInstance = instance.Clone();
					clonedInstance.Parent = muzzleOriginAttachment;
					if (clonedInstance.IsA("ParticleEmitter")) {
						clonedInstance.Rate = weaponInfo.fireRate;
					}
				});
		} else {
			task.delay(1 / weaponInfo.fireRate, () => {
				muzzleOriginAttachment.GetDescendants().forEach((instance) => instance.Destroy());
			});
		}
	}
	for (const [id, player, hasWeapon] of world.query(Player, HasWeapon)) {
		if (player.player !== Players.LocalPlayer) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
		if (!weaponId) continue;
		const [weapon, weaponModel] = world.get(weaponId, Weapon, Model);
		if (!weapon || !weaponModel) continue;
		if (hasWeapon.state !== WeaponUsageState.Shooting) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		if (!useThrottle(1 / weaponInfo.fireRate, id)) continue;
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

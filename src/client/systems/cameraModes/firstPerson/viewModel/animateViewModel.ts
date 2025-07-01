import { System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Player, ViewModel, Weapon } from "shared";
import { Weapons, WeaponUsageState } from "shared/weapons";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const [player, viewModel] = world.get(id, Player, ViewModel);
		if (!player || player.player !== Players.LocalPlayer || !viewModel) continue;
		if (hasWeaponRecord.old && hasWeaponRecord.new && hasWeaponRecord.old.state === hasWeaponRecord.new.state)
			continue;
		const animator = viewModel.model.FindFirstChild("AnimationController")?.FindFirstChild("Animator");
		if (!animator || !animator.IsA("Animator")) continue;
		if (hasWeaponRecord.new) {
			if (hasWeaponRecord.new.state === WeaponUsageState.Shooting) {
				const weaponId = state.entityIdMap.get(tostring(hasWeaponRecord.new.serverId));
				if (!weaponId) continue;
				const weapon = world.get(weaponId, Weapon);
				if (!weapon) continue;
				const weaponInfo = Weapons.get(weapon.name);
				if (!weaponInfo) continue;
				const animation = new Instance("Animation");
				animation.AnimationId = `rbxassetid://${weaponInfo.animationIds.viewModel[WeaponUsageState.Shooting]}`;
				const animationTrack = animator.LoadAnimation(animation);
				animationTrack.Name = WeaponUsageState.Shooting;
				animationTrack.Play();
				world.insert(
					id,
					hasWeaponRecord.new.patch({
						animationTrack: animationTrack,
					}),
				);
			}
		}
		if (
			hasWeaponRecord.old?.state === WeaponUsageState.Shooting &&
			hasWeaponRecord.new?.state !== WeaponUsageState.Shooting
		) {
			hasWeaponRecord.old.animationTrack?.Stop();
		}
	}
};
export = system;

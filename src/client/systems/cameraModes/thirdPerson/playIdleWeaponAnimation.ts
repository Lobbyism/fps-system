import { AnyEntity, System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player, Weapon } from "shared";
import { Weapons, WeaponUsageState } from "shared/weapons";
const playWeaponIdleAnimation = (world: World, weaponId: AnyEntity, playerModel: Model) => {
	const weapon = world.get(weaponId, Weapon);
	if (!weapon) return;
	const weaponInfo = Weapons.get(weapon.name);
	if (!weaponInfo) return;
	const animator = playerModel.FindFirstChild("Humanoid")?.FindFirstChild("Animator");
	if (!animator || !animator.IsA("Animator")) return;
	const animation = new Instance("Animation");
	animation.AnimationId = `rbxassetid://${weaponInfo.animationIds.character[WeaponUsageState.Idle]}`;
	const animationTrack = animator.LoadAnimation(animation);
	animationTrack.Play();
};
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const [player, playerModel] = world.get(id, Player, Model);
		if (!player || !playerModel || player.player !== Players.LocalPlayer) continue;
		if (!hasWeaponRecord.new) continue;
		if (hasWeaponRecord.new.state !== WeaponUsageState.Idle) continue;
		if (hasWeaponRecord.old && hasWeaponRecord.old.state === hasWeaponRecord.new.state) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeaponRecord.new.serverId));
		if (!weaponId) continue;
		playWeaponIdleAnimation(world, weaponId, playerModel.model);
	}
	for (const [id, modelRecord] of world.queryChanged(Model)) {
		if (!world.contains(id)) continue;
		if (!modelRecord.new) continue;
		const [player, hasWeapon] = world.get(id, Player, HasWeapon);
		if (!player || !hasWeapon || player.player !== Players.LocalPlayer) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
		if (!weaponId) continue;
		playWeaponIdleAnimation(world, weaponId, modelRecord.new.model);
	}
};
export = system;

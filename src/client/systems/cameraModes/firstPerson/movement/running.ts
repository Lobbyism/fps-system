import { System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Movement, Player, ViewModel, Weapon } from "shared";
import { MovementState, Weapons, WeaponUsageState } from "shared/weapons";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, player, playerModel, viewModel, hasWeapon, playerMovement] of world.query(
		Player,
		Model,
		ViewModel,
		HasWeapon,
		Movement,
	)) {
		if (player.player !== Players.LocalPlayer) continue;
		if (playerMovement.state === MovementState.Sliding) continue;
		const humanoid = playerModel.model.FindFirstChildWhichIsA("Humanoid");
		if (!humanoid) continue;
		const animator = viewModel.model.FindFirstChild("AnimationController")?.FindFirstChild("Animator");
		if (!animator || !animator.IsA("Animator")) continue;
		const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
		if (!weaponId) continue;
		const weapon = world.get(weaponId, Weapon);
		if (!weapon) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		if (humanoid.MoveDirection.FuzzyEq(Vector3.zero, 0.1)) {
			if (playerMovement.state !== MovementState.Running) continue;
			world.insert(
				id,
				Movement({
					state: MovementState.Idle,
				}),
			);
		} else {
			if (playerMovement.state === MovementState.Running) continue;
			if (hasWeapon.state === WeaponUsageState.Shooting) continue;
			if (viewModel.isAimingDownSights) continue;
			const animation = new Instance("Animation");
			animation.AnimationId = `rbxassetid://${weaponInfo.animationIds.viewModel[MovementState.Running]}`;
			const animationTrack = animator.LoadAnimation(animation);
			animationTrack.Play();
			world.insert(
				id,
				Movement({
					state: MovementState.Running,
					animationTrack: animationTrack,
				}),
			);
		}
	}
	for (const [id, viewModelRecord] of world.queryChanged(ViewModel)) {
		if (!world.contains(id)) continue;
		if (!viewModelRecord.new) continue;
		const [player, playerMovement] = world.get(id, Player, Movement);
		if (!player || !playerMovement || player.player !== Players.LocalPlayer) continue;
		if (playerMovement.state !== MovementState.Running) continue;
		if (viewModelRecord.new.isAimingDownSights) {
			playerMovement.animationTrack.Stop();
		} else if (viewModelRecord.old?.isAimingDownSights) {
			playerMovement.animationTrack.Play();
		}
	}
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const [player, playerMovement, viewModel] = world.get(id, Player, Movement, ViewModel);
		if (!player || !playerMovement || !viewModel || player.player !== Players.LocalPlayer) continue;
		if (!hasWeaponRecord.new) continue;
		if (playerMovement.state !== MovementState.Running) continue;
		if (hasWeaponRecord.new.state === WeaponUsageState.Shooting) {
			playerMovement.animationTrack.Stop();
		} else if (!viewModel.isAimingDownSights) {
			playerMovement.animationTrack.Play();
		}
	}
	for (const [id, playerMovementRecord] of world.queryChanged(Movement)) {
		if (!world.contains(id)) continue;
		if (playerMovementRecord.old?.state !== MovementState.Running) continue;
		if (playerMovementRecord.new?.state === MovementState.Running) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		playerMovementRecord.old.animationTrack.Stop();
	}
};
export = system;

import { AnyEntity, System, useEvent, World } from "@rbxts/matter";
import { Players, UserInputService } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player, ViewModel, Weapon } from "shared";
import { MovementState, Weapons } from "shared/weapons";
const getSlidingAnimationId = (world: World, state: ClientState, id: AnyEntity) => {
	const result = "rbxassetid://79994438112815";
	const hasWeapon = world.get(id, HasWeapon);
	if (!hasWeapon) return result;
	const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
	if (!weaponId) return result;
	const weapon = world.get(weaponId, Weapon);
	if (!weapon) return result;
	const weaponInfo = Weapons.get(weapon.name);
	if (!weaponInfo) return result;
	return `rbxassetid://${weaponInfo.animationIds[MovementState.Sliding]}`;
};
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, player, playerModel, viewModel] of world.query(Player, Model, ViewModel)) {
		if (player.player !== Players.LocalPlayer) continue;
		const humanoid = playerModel.model.FindFirstChild("Humanoid");
		if (!humanoid || !humanoid.IsA("Humanoid")) continue;
		const animator = viewModel.model.FindFirstChild("AnimationController")?.FindFirstChild("Animator");
		if (!animator || !animator.IsA("Animator")) continue;
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
			if (gameProcessedEvent) return;
			if (input.KeyCode === Enum.KeyCode.C) {
				if (humanoid.MoveDirection.FuzzyEq(Vector3.zero, 0.1)) continue;
				if (state.isCharacterSliding) continue;
				if (!playerModel.model.PrimaryPart) continue;
				const rootRigAttachment = playerModel.model.PrimaryPart.FindFirstChild("RootRigAttachment");
				if (!rootRigAttachment || !rootRigAttachment.IsA("Attachment")) continue;
				task.delay(2, () => {
					state.isCharacterSliding = false;
					linearVelocity.Destroy();
					viewModelSlidingAnimationTrack.Stop();
				});
				state.isCharacterSliding = true;
				const linearVelocity = new Instance("LinearVelocity");
				linearVelocity.Attachment0 = rootRigAttachment;
				linearVelocity.VectorVelocity = humanoid.MoveDirection.Unit.mul(25);
				linearVelocity.ForceLimitMode = Enum.ForceLimitMode.PerAxis;
				linearVelocity.MaxAxesForce = new Vector3(1, 0, 1).mul(1e6);
				linearVelocity.Parent = playerModel.model;

				const viewModelSlidingAnimation = new Instance("Animation");
				viewModelSlidingAnimation.AnimationId = getSlidingAnimationId(world, state, id);
				const viewModelSlidingAnimationTrack = animator.LoadAnimation(viewModelSlidingAnimation);
				viewModelSlidingAnimationTrack.Play();
			}
		}
	}
};
export = system;

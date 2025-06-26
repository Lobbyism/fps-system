import { AnyEntity, System, useEvent, useThrottle, World } from "@rbxts/matter";
import { Players, UserInputService } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Movement, Player, ViewModel, Weapon } from "shared";
import { MovementState, Weapons } from "shared/weapons";
const SLIDE_LINEAR_VELOCITY_NAME = "SlideLinearVelocity";
const SLIDE_VIEWMODEL_ANIMATION_TRACK_NAME = "Slide";
const SLIDE_DURATION = 2;
const SLIDE_COOLDOWN_DURATION = 1;
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
		const playerMovement = world.get(id, Movement);
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
			if (gameProcessedEvent) return;
			if (input.KeyCode === Enum.KeyCode.LeftShift) {
				if (humanoid.MoveDirection.FuzzyEq(Vector3.zero, 0.1)) continue;
				if (playerMovement && playerMovement.state === MovementState.Sliding) continue;
				if (!playerModel.model.PrimaryPart) continue;
				const rootRigAttachment = playerModel.model.PrimaryPart.FindFirstChild("RootRigAttachment");
				if (!rootRigAttachment || !rootRigAttachment.IsA("Attachment")) continue;
				if (!useThrottle(SLIDE_COOLDOWN_DURATION)) continue;
				const linearVelocity = new Instance("LinearVelocity");
				linearVelocity.Attachment0 = rootRigAttachment;
				linearVelocity.VectorVelocity = humanoid.MoveDirection.Unit.mul(25);
				linearVelocity.ForceLimitMode = Enum.ForceLimitMode.PerAxis;
				linearVelocity.MaxAxesForce = new Vector3(1, 0, 1).mul(1e6);
				linearVelocity.Name = SLIDE_LINEAR_VELOCITY_NAME;
				linearVelocity.Parent = playerModel.model;
				const viewModelSlidingAnimation = new Instance("Animation");
				viewModelSlidingAnimation.AnimationId = getSlidingAnimationId(world, state, id);
				const viewModelSlidingAnimationTrack = animator.LoadAnimation(viewModelSlidingAnimation);
				viewModelSlidingAnimationTrack.Name = SLIDE_VIEWMODEL_ANIMATION_TRACK_NAME;
				viewModelSlidingAnimationTrack.Play();
				world.insert(
					id,
					Movement({
						animationTrack: viewModelSlidingAnimationTrack,
						initialVelocity: linearVelocity.VectorVelocity,
						linearVelocity: linearVelocity,
						startTime: DateTime.now(),
						state: MovementState.Sliding,
					}),
				);
			} else if (input.KeyCode === Enum.KeyCode.Space) {
				if (!playerMovement || playerMovement.state !== MovementState.Sliding) continue;
				world.insert(
					id,
					Movement({
						state: "Idle",
					}),
				);
			}
		}
	}
	for (const [id, player, playerMovement] of world.query(Player, Movement)) {
		if (player.player !== Players.LocalPlayer) continue;
		if (playerMovement.state !== MovementState.Sliding) continue;
		playerMovement.linearVelocity.VectorVelocity = playerMovement.initialVelocity.Lerp(
			Vector3.zero,
			math.clamp(
				(DateTime.now().UnixTimestampMillis - playerMovement.startTime.UnixTimestampMillis) /
					1000 /
					SLIDE_DURATION,
				0,
				1,
			),
		);
		if (playerMovement.linearVelocity.VectorVelocity.Magnitude < 8) {
			world.insert(
				id,
				Movement({
					state: "Idle",
				}),
			);
		}
	}
	for (const [id, playerMovementRecord] of world.queryChanged(Movement)) {
		if (!world.contains(id)) continue;
		if (playerMovementRecord.old?.state !== MovementState.Sliding) continue;
		if (playerMovementRecord.new?.state === MovementState.Sliding) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		playerMovementRecord.old.animationTrack.Stop();
		playerMovementRecord.old.linearVelocity.Destroy();
	}
};
export = system;

import { System, World } from "@rbxts/matter";
import { Players, UserInputService } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player } from "shared";
import { Attributes } from "shared/attributes";
const HOLD_ANIMATION_TRACK_NAME = "HoldAnimationTrack";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [_, player, playerModel, hasWeapon] of world.query(Player, Model, HasWeapon)) {
		if (player.player !== Players.LocalPlayer) continue;
		const humanoid = playerModel.model.FindFirstChildWhichIsA("Humanoid");
		const animator = humanoid?.FindFirstChildWhichIsA("Animator");
		if (!humanoid || !animator) continue;
		let shouldPlayAnimation = humanoid.MoveDirection.FuzzyEq(Vector3.zero, 1e-1);
		if (UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton1)) {
			shouldPlayAnimation = true;
		}
		if (shouldPlayAnimation) {
			const weaponModel = world.get(hasWeapon.serverId, Model);
			if (!weaponModel) continue;
			const animationId = weaponModel.model.GetAttribute(Attributes.IdleAnimationId);
			if (!typeIs(animationId, "string")) continue;
			if (
				animator
					.GetPlayingAnimationTracks()
					.find((animationTrack) => animationTrack.Name === HOLD_ANIMATION_TRACK_NAME)
			)
				continue;
			if (!state.entityIdMap.get(tostring(hasWeapon.serverId))) continue;
			const animation = new Instance("Animation");
			animation.AnimationId = `rbxassetid://${animationId}`;
			const animationTrack = animator.LoadAnimation(animation);
			animationTrack.Name = HOLD_ANIMATION_TRACK_NAME;
			animationTrack.Play();
		} else {
			animator.GetPlayingAnimationTracks().forEach((animationTrack) => {
				if (animationTrack.Name !== HOLD_ANIMATION_TRACK_NAME) return;
				animationTrack.Stop();
			});
		}
	}
};
export = system;

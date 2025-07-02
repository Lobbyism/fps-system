import { System, useEvent, useThrottle, World } from "@rbxts/matter";
import { Players, ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { getSpreadDirection } from "client/utils/shooting";
import { HasWeapon, Model, Player, WEAPON_REMOTE, ViewModel, Weapon, Ammo, Camera } from "shared";
import { canReload, canShoot, Weapons, WeaponUsageState } from "shared/weapons";
const RAYCAST_DISTANCE = 1e5;
const weaponRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(WEAPON_REMOTE.name) as RemoteEvent;
const doesPlayerWantToStartShooting = (state: ClientState, raycastResult?: RaycastResult) => {
	if (state.preferredInput === Enum.PreferredInput.KeyboardAndMouse) {
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
			if (gameProcessedEvent) return false;
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) return false;
			return true;
		}
	} else {
		const raycastHumanoid = raycastResult?.Instance.Parent?.FindFirstChildWhichIsA("Humanoid");
		if (
			(!raycastHumanoid || raycastHumanoid.Health <= 0) &&
			state.touchPressedWeaponUsageState !== WeaponUsageState.Shooting
		)
			return false;
		return true;
	}
	return false;
};
const doesPlayerWantToStopShooting = (
	state: ClientState,
	playerHasWeapon: HasWeapon,
	raycastResult?: RaycastResult,
) => {
	if (state.preferredInput === Enum.PreferredInput.KeyboardAndMouse) {
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputEnded")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) continue;
			return true;
		}
	} else {
		if (playerHasWeapon.state !== WeaponUsageState.Shooting) return false;
		if (state.touchPressedWeaponUsageState === WeaponUsageState.Shooting) return false;
		if (!raycastResult) return true;
		const raycastHumanoid = raycastResult?.Instance.Parent?.FindFirstChildWhichIsA("Humanoid");
		if (!raycastHumanoid) return true;
		return raycastHumanoid.Health <= 0;
	}
	return false;
};
const doesPlayerWantToReload = (state: ClientState) => {
	if (state.preferredInput === Enum.PreferredInput.KeyboardAndMouse) {
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
			if (gameProcessedEvent) continue;
			if (input.KeyCode === Enum.KeyCode.R) return true;
		}
	} else {
		if (state.touchPressedWeaponUsageState === WeaponUsageState.Reloading) {
			return true;
		}
	}
	return false;
};
const system: System<[World, ClientState]> = (world, state) => {
	if (!Workspace.CurrentCamera) return;
	for (const [id, player, playerModel, playerAmmo, playerHasWeapon, playerCamera] of world.query(
		Player,
		Model,
		Ammo,
		HasWeapon,
		Camera,
	)) {
		if (player.player !== Players.LocalPlayer) continue;
		let muzzleOriginAttachment: Attachment | undefined;
		let rayFromViewportPoint: Ray | undefined;
		const weaponId = state.entityIdMap.get(tostring(playerHasWeapon.serverId));
		if (!weaponId) continue;
		const weapon = world.get(weaponId, Weapon);
		if (!weapon) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		if (playerCamera.cameraMode === "FirstPerson") {
			const viewModel = world.get(id, ViewModel);
			if (!viewModel) continue;
			const attachment = viewModel.model.FindFirstChild("MuzzleOrigin", true);
			if (!attachment || !attachment.IsA("Attachment")) continue;
			muzzleOriginAttachment = attachment;
		} else if (playerCamera.cameraMode === "ThirdPerson") {
			const weaponModel = world.get(weaponId, Model);
			if (!weaponModel) continue;
			const attachment = weaponModel.model.FindFirstChild("MuzzleOrigin", true);
			if (!attachment || !attachment.IsA("Attachment")) continue;
			muzzleOriginAttachment = attachment;
		}
		rayFromViewportPoint = Workspace.CurrentCamera.ViewportPointToRay(
			Workspace.CurrentCamera.ViewportSize.X / 2,
			Workspace.CurrentCamera.ViewportSize.Y / 2,
		);
		if (!muzzleOriginAttachment) continue;
		if (!rayFromViewportPoint) continue;
		const raycastIgnoreFolder = Workspace.FindFirstChild("garbage");
		const raycastParams = new RaycastParams();
		raycastParams.AddToFilter(playerModel.model);
		if (raycastIgnoreFolder) {
			raycastParams.AddToFilter(raycastIgnoreFolder);
		}
		raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
		const raycastResult = Workspace.Raycast(
			rayFromViewportPoint.Origin,
			rayFromViewportPoint.Direction.mul(RAYCAST_DISTANCE),
			raycastParams,
		);
		const targetPosition = raycastResult
			? raycastResult.Position
			: rayFromViewportPoint.Origin.add(rayFromViewportPoint.Direction.mul(RAYCAST_DISTANCE));
		let playerWantsToStartShooting = doesPlayerWantToStartShooting(state, raycastResult);
		let playerWantsToStopShooting = doesPlayerWantToStopShooting(state, playerHasWeapon, raycastResult);
		let playerWantsToReload = doesPlayerWantToReload(state);
		if (
			playerWantsToStartShooting &&
			canShoot(weapon) &&
			playerHasWeapon.state !== WeaponUsageState.Shooting &&
			useThrottle(1 / weaponInfo.fireRate, weaponId)
		) {
			world.insert(
				id,
				playerHasWeapon.patch({
					state: WeaponUsageState.Shooting,
				}),
			);
			world.insert(
				weaponId,
				weapon.patch({
					magazine: weapon.magazine - 1,
				}),
			);
			weaponRemoteEvent.FireServer({
				type: WEAPON_REMOTE.payloads.startShooting,
				origin: muzzleOriginAttachment.WorldPosition,
				direction: getSpreadDirection(
					muzzleOriginAttachment.WorldPosition,
					targetPosition,
					weaponInfo.spreadAngle,
				),
			});
		} else if (playerWantsToStopShooting) {
			world.insert(
				id,
				playerHasWeapon.patch({
					state: WeaponUsageState.Idle,
				}),
			);
			weaponRemoteEvent.FireServer({
				type: WEAPON_REMOTE.payloads.stopShooting,
			});
		} else if (playerWantsToReload && canReload(playerAmmo, playerHasWeapon, weapon)) {
			world.insert(
				id,
				playerHasWeapon.patch({
					state: WeaponUsageState.Reloading,
				}),
			);
			weaponRemoteEvent.FireServer({
				type: WEAPON_REMOTE.payloads.reload,
			});
		}
		if (
			playerHasWeapon.state === WeaponUsageState.Shooting &&
			canShoot(weapon) &&
			useThrottle(1 / weaponInfo.fireRate, weaponId)
		) {
			weaponRemoteEvent.FireServer({
				type: WEAPON_REMOTE.payloads.updateAim,
				origin: muzzleOriginAttachment.WorldPosition,
				direction: getSpreadDirection(
					muzzleOriginAttachment.WorldPosition,
					targetPosition,
					weaponInfo.spreadAngle,
				),
			});
		}
	}
};
export = system;

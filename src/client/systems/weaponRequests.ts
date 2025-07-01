import { System, useEvent, useThrottle, World } from "@rbxts/matter";
import { Players, ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { getSpreadDirection } from "client/utils/shooting";
import { HasWeapon, Model, Player, WEAPON_REMOTE, ViewModel, Weapon, Ammo } from "shared";
import { canReload, canShoot, Weapons, WeaponUsageState } from "shared/weapons";
const RAYCAST_DISTANCE = 1e5;
const weaponRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(WEAPON_REMOTE.name) as RemoteEvent;
const system: System<[World, ClientState]> = (world, state) => {
	if (!Workspace.CurrentCamera) return;
	for (const [id, player, playerModel, playerAmmo, hasWeapon] of world.query(Player, Model, Ammo, HasWeapon)) {
		if (player.player !== Players.LocalPlayer) continue;
		let muzzleOriginAttachment: Attachment | undefined;
		let rayFromViewportPoint: Ray | undefined;
		const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
		if (!weaponId) continue;
		const weapon = world.get(weaponId, Weapon);
		if (!weapon) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		if (state.cameraMode === Enum.CameraMode.Classic) {
			const weaponModel = world.get(weaponId, Model);
			if (!weaponModel) continue;
			const attachment = weaponModel.model.FindFirstChild("MuzzleOrigin", true);
			if (!attachment || !attachment.IsA("Attachment")) continue;
			muzzleOriginAttachment = attachment;
			rayFromViewportPoint = Workspace.CurrentCamera.ViewportPointToRay(
				Workspace.CurrentCamera.ViewportSize.X / 2,
				Workspace.CurrentCamera.ViewportSize.Y / 2,
			);
		} else if (state.cameraMode === Enum.CameraMode.LockFirstPerson) {
			const viewModel = world.get(id, ViewModel);
			if (!viewModel) continue;
			const attachment = viewModel.model.FindFirstChild("MuzzleOrigin", true);
			if (!attachment || !attachment.IsA("Attachment")) continue;
			muzzleOriginAttachment = attachment;
			const mouseLocation = UserInputService.GetMouseLocation();
			rayFromViewportPoint = Workspace.CurrentCamera.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);
		}
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
		if (UserInputService.PreferredInput === Enum.PreferredInput.KeyboardAndMouse) {
			for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
				if (gameProcessedEvent) continue;
				if (!weapon) continue;
				if (input.UserInputType === Enum.UserInputType.MouseButton1) {
					if (canShoot(weapon) && useThrottle(1 / weaponInfo.fireRate, weaponId)) {
						world.insert(
							id,
							hasWeapon.patch({
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
					} else if (canReload(playerAmmo, hasWeapon, weapon)) {
						world.insert(
							id,
							hasWeapon.patch({
								state: WeaponUsageState.Reloading,
							}),
						);
						weaponRemoteEvent.FireServer({
							type: WEAPON_REMOTE.payloads.reload,
						});
					}
				} else if (input.KeyCode === Enum.KeyCode.R && canReload(playerAmmo, hasWeapon, weapon)) {
					world.insert(
						id,
						hasWeapon.patch({
							state: WeaponUsageState.Reloading,
						}),
					);
					weaponRemoteEvent.FireServer({
						type: WEAPON_REMOTE.payloads.reload,
					});
				}
			}
			if (
				UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton1) &&
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
			for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputEnded")) {
				if (gameProcessedEvent) continue;
				if (input.UserInputType !== Enum.UserInputType.MouseButton1) continue;
				world.insert(
					id,
					hasWeapon.patch({
						state: WeaponUsageState.Idle,
					}),
				);
				weaponRemoteEvent.FireServer({
					type: WEAPON_REMOTE.payloads.stopShooting,
				});
			}
		} else if (UserInputService.PreferredInput === Enum.PreferredInput.Touch) {
			if (
				state.touchPressedWeaponUsageState === WeaponUsageState.Reloading &&
				canReload(playerAmmo, hasWeapon, weapon)
			) {
				world.insert(
					id,
					hasWeapon.patch({
						state: WeaponUsageState.Reloading,
					}),
				);
				weaponRemoteEvent.FireServer({
					type: WEAPON_REMOTE.payloads.reload,
				});
				continue;
			}
			const raycastHumanoid = raycastResult?.Instance.Parent?.FindFirstChildWhichIsA("Humanoid");
			if (
				state.touchPressedWeaponUsageState !== WeaponUsageState.Shooting &&
				(!raycastHumanoid || raycastHumanoid.Health <= 0)
			) {
				if (hasWeapon.state === WeaponUsageState.Shooting) {
					world.insert(
						id,
						hasWeapon.patch({
							state: WeaponUsageState.Idle,
						}),
					);
					weaponRemoteEvent.FireServer({
						type: WEAPON_REMOTE.payloads.stopShooting,
					});
				}
				continue;
			}
			if (
				hasWeapon.state !== WeaponUsageState.Shooting &&
				canShoot(weapon) &&
				useThrottle(1 / weaponInfo.fireRate, weaponId)
			) {
				world.insert(
					id,
					hasWeapon.patch({
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
			} else if (useThrottle(1 / weaponInfo.fireRate, weaponId)) {
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
	}
};
export = system;

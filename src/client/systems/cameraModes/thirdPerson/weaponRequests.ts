import { System, useThrottle, World } from "@rbxts/matter";
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { getSpreadDirection } from "client/utils/shooting";
import { HasWeapon, Model, Player, Weapon, WEAPON_REMOTE } from "shared";
import { canShoot, Weapons, WeaponUsageState } from "shared/weapons";
const RAYCAST_DISTANCE = 1e5;
const weaponRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(WEAPON_REMOTE.name) as RemoteEvent;
const system: System<[World, ClientState]> = (world, state) => {
	if (!Workspace.CurrentCamera) return;
	for (const [id, player, playerModel, hasWeapon] of world.query(Player, Model, HasWeapon)) {
		if (player.player !== Players.LocalPlayer) continue;
		const rayFromViewportPoint = Workspace.CurrentCamera.ViewportPointToRay(
			Workspace.CurrentCamera.ViewportSize.X / 2,
			Workspace.CurrentCamera.ViewportSize.Y / 2,
		);
		const garbageFolder = Workspace.FindFirstChild("garbage");
		const raycastParams = new RaycastParams();
		raycastParams.AddToFilter(playerModel.model);
		if (garbageFolder) {
			raycastParams.AddToFilter(garbageFolder);
		}
		raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
		const raycastResult = Workspace.Raycast(
			rayFromViewportPoint.Origin,
			rayFromViewportPoint.Direction.mul(RAYCAST_DISTANCE),
			raycastParams,
		);
		const raycastHumanoid = raycastResult?.Instance.Parent?.FindFirstChildWhichIsA("Humanoid");
		if (!raycastHumanoid || raycastHumanoid.Health <= 0) {
			// print("Stop shooting!");
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
		const targetPosition = raycastResult
			? raycastResult.Position
			: rayFromViewportPoint.Origin.add(rayFromViewportPoint.Direction.mul(RAYCAST_DISTANCE));
		const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
		if (!weaponId) continue;
		const [weapon, weaponModel] = world.get(weaponId, Weapon, Model);
		if (!weapon || !weaponModel) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		const muzzleOriginAttachment = weaponModel.model.FindFirstChild("MuzzleOrigin", true);
		if (!muzzleOriginAttachment || !muzzleOriginAttachment.IsA("Attachment")) continue;
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
			// print("Start shooting!");
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
			// print("Update aim!");
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

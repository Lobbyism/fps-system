import { System, useEvent, useThrottle, World } from "@rbxts/matter";
import { Players, ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player, SHOOT_REMOTE, ViewModel, Weapon } from "shared";
const RAYCAST_DISTANCE = 1e5;
const shootRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(SHOOT_REMOTE.name) as RemoteEvent;
const system: System<[World, ClientState]> = (world, state) => {
	if (UserInputService.PreferredInput !== Enum.PreferredInput.KeyboardAndMouse) return;
	for (const [id, player, playerModel, hasWeapon] of world.query(Player, Model, HasWeapon)) {
		if (player.player !== Players.LocalPlayer) continue;
		if (!Workspace.CurrentCamera) continue;
		const mouseLocation = UserInputService.GetMouseLocation();
		const rayFromViewportPoint = Workspace.CurrentCamera.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);
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
		const targetPosition = raycastResult
			? raycastResult.Position
			: rayFromViewportPoint.Origin.add(rayFromViewportPoint.Direction.mul(RAYCAST_DISTANCE));
		const viewModel = world.get(id, ViewModel);
		if (!viewModel) continue;
		const muzzleOriginAttachment = viewModel.model.FindFirstChild("MuzzleOrigin", true);
		if (!muzzleOriginAttachment || !muzzleOriginAttachment.IsA("Attachment")) continue;
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) continue;
			const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
			if (!weaponId) continue;
			const weapon = world.get(weaponId, Weapon);
			if (!weapon) continue;
			world.insert(
				weaponId,
				weapon.patch({
					isShooting: true,
				}),
			);
			shootRemoteEvent.FireServer({
				type: SHOOT_REMOTE.payloads.start,
				origin: muzzleOriginAttachment.WorldPosition,
				direction: targetPosition.sub(muzzleOriginAttachment.WorldPosition).Unit,
			});
		}
		if (UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton1) && useThrottle(0.05)) {
			shootRemoteEvent.FireServer({
				type: SHOOT_REMOTE.payloads.update,
				origin: muzzleOriginAttachment.WorldPosition,
				direction: targetPosition.sub(muzzleOriginAttachment.WorldPosition).Unit,
			});
		}
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputEnded")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) continue;
			const weaponId = state.entityIdMap.get(tostring(hasWeapon.serverId));
			if (!weaponId) continue;
			const weapon = world.get(weaponId, Weapon);
			if (!weapon) continue;
			world.insert(
				hasWeapon.serverId,
				weapon.patch({
					isShooting: false,
				}),
			);
			shootRemoteEvent.FireServer({
				type: SHOOT_REMOTE.payloads.stop,
			});
		}
	}
};
export = system;

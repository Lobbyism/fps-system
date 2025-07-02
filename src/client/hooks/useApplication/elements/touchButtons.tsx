import React from "@rbxts/react";
import { UIRenderer, UIUpdater } from "..";
import { Camera, HasWeapon, Player } from "shared";
import { Players } from "@rbxts/services";
import { TouchButtons } from "client/gui/components/TouchButtons";
let firstRunSystem = true;
let playerHasWeapon = false;
export const touchButtonsUpdater: UIUpdater = (world, state) => {
	if (firstRunSystem) {
		firstRunSystem = false;
	}
	let stateChanged = false;
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		if (playerHasWeapon !== (hasWeaponRecord.new !== undefined)) {
			stateChanged = true;
		}
		playerHasWeapon = hasWeaponRecord.new !== undefined;
	}
	return stateChanged;
};
export const touchButtonsRenderer: UIRenderer = (world, state) => {
	return playerHasWeapon && state.preferredInput === Enum.PreferredInput.Touch ? (
		<TouchButtons
			setTouchPressedWeaponUsageState={(touchPressedWeaponUsageState) => {
				state.touchPressedWeaponUsageState = touchPressedWeaponUsageState;
			}}
			setTouchPressedMovementState={(touchPressedMovementState) => {
				state.touchPressedMovementState = touchPressedMovementState;
			}}
			toggleCameraMode={() => {
				const [cameraId, camera] = world.query(Camera)();
				if (!cameraId) return;
				world.insert(
					cameraId,
					camera.patch({
						cameraMode: camera.cameraMode === "FirstPerson" ? "ThirdPerson" : "FirstPerson",
					}),
				);
			}}
		/>
	) : undefined;
};

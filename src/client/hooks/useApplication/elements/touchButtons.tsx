import React from "@rbxts/react";
import { useEvent, World } from "@rbxts/matter";
import { UIRenderer, UIUpdater } from "..";
import { HasWeapon, Player } from "shared";
import { Players, UserInputService } from "@rbxts/services";
import { TouchButtons } from "client/gui/components/TouchButtons";
import { WeaponUsageState } from "shared/weapons";
let firstRunSystem = true;
let playerHasWeapon = false;
let playerPreferredInput: Enum.PreferredInput | undefined;
export const touchButtonsUpdater: UIUpdater = (world: World) => {
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
	for (const [] of useEvent(UserInputService, UserInputService.GetPropertyChangedSignal("PreferredInput"))) {
		if (playerPreferredInput === UserInputService.PreferredInput) continue;
		stateChanged = true;
		playerPreferredInput = UserInputService.PreferredInput;
	}
	return stateChanged;
};
export const touchButtonsRenderer: UIRenderer = (_, state) => {
	return playerHasWeapon && playerPreferredInput === Enum.PreferredInput.Touch ? (
		<TouchButtons
			setTouchPressedWeaponUsageState={(weaponUsageState) => {
				state.touchPressedWeaponUsageState = weaponUsageState;
			}}
		/>
	) : undefined;
};

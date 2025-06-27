import React from "@rbxts/react";
import { Crosshair } from "client/gui/components/Crosshair";
import { UIRenderer, UIUpdater } from "..";
import { World } from "@rbxts/matter";
import { HasWeapon, Player } from "shared";
import { Players } from "@rbxts/services";
export const crosshairUpdater: UIUpdater = (world: World) => {
	let stateChanged = false;
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		if (hasWeaponRecord.new && !hasWeaponRecord.old) {
			stateChanged = true;
		} else if (hasWeaponRecord.old && !hasWeaponRecord.new) {
			stateChanged = true;
		}
	}
	return stateChanged;
};
export const crosshairRenderer: UIRenderer = () => {
	return <Crosshair />;
};

import { AnyEntity } from "@rbxts/matter";
import { receiveReplication } from "./receiveReplication";
import { start } from "shared/start";
import { RunService, StarterPlayer, UserInputService } from "@rbxts/services";
import { WeaponUsageState } from "shared/weapons";
let cameraMode: Enum.CameraMode | undefined;
if (RunService.IsStudio()) {
	// Choose a camera mode
	// cameraMode = Enum.CameraMode.LockFirstPerson;
	// StarterPlayer.StarterPlayerScripts.TS.systems.cameraModes.thirdPerson.Destroy();
	cameraMode = Enum.CameraMode.Classic;
	StarterPlayer.StarterPlayerScripts.TS.systems.cameraModes.firstPerson.Destroy();
} else {
	if (UserInputService.PreferredInput === Enum.PreferredInput.KeyboardAndMouse) {
		cameraMode = Enum.CameraMode.LockFirstPerson;
		StarterPlayer.StarterPlayerScripts.TS.systems.cameraModes.thirdPerson.Destroy();
	} else if (UserInputService.PreferredInput === Enum.PreferredInput.Touch) {
		cameraMode = Enum.CameraMode.Classic;
		// Technically, both first person and third person camera systems should be active on mobile since the player can toggle between them...
		StarterPlayer.StarterPlayerScripts.TS.systems.cameraModes.firstPerson.Destroy();
	}
}
assert(cameraMode);
export type TouchPressedWeaponUsageState = (typeof WeaponUsageState)["Shooting" | "Reloading"];
export interface ClientState {
	cameraMode: Enum.CameraMode;
	entityIdMap: Map<string, AnyEntity>;
	reverseEntityIdMap: Map<AnyEntity, string>;
	touchPressedWeaponUsageState?: TouchPressedWeaponUsageState;
}
start([StarterPlayer.StarterPlayerScripts.TS.systems], {
	cameraMode: cameraMode,
	entityIdMap: new Map<string, AnyEntity>(),
	reverseEntityIdMap: new Map<AnyEntity, string>(),
})(receiveReplication);

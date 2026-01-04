import { AnyEntity } from "@rbxts/matter";
import { receiveReplication } from "./receiveReplication";
import { start } from "shared/start";
import { RunService, StarterPlayer, UserInputService } from "@rbxts/services";
import { MovementState, WeaponUsageState } from "shared/weapons";
export type TouchPressedWeaponUsageState = (typeof WeaponUsageState)["Shooting" | "Reloading"];
export type TouchPressedMovementState = (typeof MovementState)["Sliding" | "Idle"] | "Jumping";
export interface ClientState {
	entityIdMap: Map<string, AnyEntity>;
	reverseEntityIdMap: Map<AnyEntity, string>;
	touchPressedWeaponUsageState?: TouchPressedWeaponUsageState;
	touchPressedMovementState?: TouchPressedMovementState;
	preferredInput: Enum.PreferredInput;
}
start([StarterPlayer.StarterPlayerScripts.TS.systems], {
	entityIdMap: new Map<string, AnyEntity>(),
	reverseEntityIdMap: new Map<AnyEntity, string>(),
	preferredInput: RunService.IsStudio() ? Enum.PreferredInput.Touch : UserInputService.PreferredInput,
})(receiveReplication);

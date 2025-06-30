import { AnyEntity } from "@rbxts/matter";
import { receiveReplication } from "./receiveReplication";
import { start } from "shared/start";
import { StarterPlayer, UserInputService } from "@rbxts/services";
if (UserInputService.PreferredInput === Enum.PreferredInput.KeyboardAndMouse) {
	StarterPlayer.StarterPlayerScripts.TS.systems.cameraModes.thirdPerson.Destroy();
} else if (UserInputService.PreferredInput === Enum.PreferredInput.Touch) {
	// Currently, there is no mechanism to toggle between first person and third person camera on mobile
	StarterPlayer.StarterPlayerScripts.TS.systems.cameraModes.firstPerson.Destroy();
}
export interface ClientState {
	entityIdMap: Map<string, AnyEntity>;
	reverseEntityIdMap: Map<AnyEntity, string>;
}
start([StarterPlayer.StarterPlayerScripts.TS.systems], {
	entityIdMap: new Map<string, AnyEntity>(),
	reverseEntityIdMap: new Map<AnyEntity, string>(),
})(receiveReplication);

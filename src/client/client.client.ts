import { AnyEntity } from "@rbxts/matter";
import { receiveReplication } from "./receiveReplication";
import { start } from "shared/start";
import { RunService, StarterPlayer, UserInputService } from "@rbxts/services";
let cameraMode: Enum.CameraMode | undefined;
if (RunService.IsStudio()) {
	// Choose a camera mode
	// cameraMode = Enum.CameraMode.LockFirstPerson;
	// StarterPlayer.StarterPlayerScripts.TS.systems.cameraModes.thirdPerson.Destroy();
	cameraMode = Enum.CameraMode.Classic;
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

import { AnyEntity } from "@rbxts/matter";
import { receiveReplication } from "./receiveReplication";
import { start } from "shared/start";
import { StarterPlayer } from "@rbxts/services";

export interface ClientState {
	entityIdMap: Map<string, AnyEntity>;
	reverseEntityIdMap: Map<AnyEntity, string>;
}
start([StarterPlayer.StarterPlayerScripts.TS.systems], {
	entityIdMap: new Map<string, AnyEntity>(),
	reverseEntityIdMap: new Map<AnyEntity, string>(),
})(receiveReplication);

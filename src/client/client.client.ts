import { AnyEntity } from "@rbxts/matter";
import { receiveReplication } from "./receiveReplication";
import { start } from "shared/start";
import { StarterPlayer } from "@rbxts/services";

start([StarterPlayer.StarterPlayerScripts.TS.systems], { entityIdMap: new Map<string, AnyEntity>() })(
	receiveReplication,
);

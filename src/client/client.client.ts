import { AnyEntity } from "@rbxts/matter";
import { ReplicatedStorage } from "@rbxts/services";
import { receiveReplication } from "./receiveReplication";
import { start } from "shared/start";

start([ReplicatedStorage.TS.systems], { entityIdMap: new Map<string, AnyEntity>() })(receiveReplication);

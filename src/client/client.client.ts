import { AnyEntity } from "@rbxts/matter";
import { ReplicatedStorage } from "@rbxts/services";
import { receiveReplication, start } from "shared";

start([ReplicatedStorage.TS.systems], { entityIdMap: new Map<string, AnyEntity>() })(receiveReplication);

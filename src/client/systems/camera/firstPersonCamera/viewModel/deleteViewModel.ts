import { System, World } from "@rbxts/matter";
import { ViewModel } from "shared";
const system: System<[World]> = (world) => {
	for (const [id, viewModelRecord] of world.queryChanged(ViewModel)) {
		if (!world.contains(id)) continue;
		if (!viewModelRecord.old) continue;
		viewModelRecord.old.model.Destroy();
	}
};
export = system;

import { System, World } from "@rbxts/matter";
import { Players } from "@rbxts/services";
import { Camera } from "shared";
const system: System<[World]> = (world) => {
	for (const [id, cameraRecord] of world.queryChanged(Camera)) {
		if (!world.contains(id)) continue;
		if (!cameraRecord.new) continue;
		Players.LocalPlayer.CameraMode =
			cameraRecord.new.cameraMode === "FirstPerson" ? Enum.CameraMode.LockFirstPerson : Enum.CameraMode.Classic;
	}
};
export = system;

import { System, useEvent, World } from "@rbxts/matter";
import { Players, UserInputService, Workspace } from "@rbxts/services";
import { HasWeapon, Model, Player } from "shared";
let firstRunSystem = false;
let pitchAngle = 0;
const system: System<[World]> = (world) => {
	if (!Workspace.CurrentCamera) return;
	if (firstRunSystem) {
		firstRunSystem = false;
		Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
	}
	for (const [, player, playerModel] of world.query(Player, Model, HasWeapon)) {
		if (player.player !== Players.LocalPlayer) continue;
		const head = playerModel.model.FindFirstChild("Head");
		if (!head || !head.IsA("BasePart")) continue;
		const neck = playerModel.model.FindFirstChild("Head")?.FindFirstChild("Neck");
		if (!neck || !neck.IsA("Motor6D")) continue;
		const alignOrientation = playerModel.model.PrimaryPart?.FindFirstChild("AlignOrientation");
		if (!alignOrientation || !alignOrientation.IsA("AlignOrientation")) continue;
		const leftShoulder = playerModel.model.FindFirstChild("LeftUpperArm")?.FindFirstChild("LeftShoulder");
		if (!leftShoulder || !leftShoulder.IsA("Motor6D")) continue;
		const rightShoulder = playerModel.model.FindFirstChild("RightUpperArm")?.FindFirstChild("RightShoulder");
		if (!rightShoulder || !rightShoulder.IsA("Motor6D")) continue;
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputChanged")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.Touch) continue;
			const sensitivity = 0.005;
			const yawRotation = CFrame.Angles(0, -input.Delta.X * sensitivity, 0);
			alignOrientation.CFrame = alignOrientation.CFrame.mul(yawRotation);
			pitchAngle = math.clamp(pitchAngle - input.Delta.Y * sensitivity, -math.rad(80), math.rad(80));
			neck.C0 = new CFrame(neck.C0.Position).mul(CFrame.Angles(pitchAngle, 0, 0));
			leftShoulder.C0 = new CFrame(leftShoulder.C0.Position).mul(CFrame.Angles(pitchAngle, 0, 0));
			rightShoulder.C0 = new CFrame(rightShoulder.C0.Position).mul(CFrame.Angles(pitchAngle, 0, 0));
		}
		Workspace.CurrentCamera.CFrame = CFrame.lookAt(
			head.CFrame.mul(new CFrame(3.16832924, 0.884598255, 7.60850525)).Position,
			head.CFrame.mul(new CFrame(0, 0, -500)).Position,
		);
	}
	for (const [id, modelRecord] of world.queryChanged(Model)) {
		if (!world.contains(id)) continue;
		if (!modelRecord.new) continue;
		if (!modelRecord.new.model.PrimaryPart) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		const rootRigAttachment = modelRecord.new.model.PrimaryPart.FindFirstChild("RootRigAttachment");
		if (!rootRigAttachment || !rootRigAttachment.IsA("Attachment")) continue;
		const alignOrientation = new Instance("AlignOrientation");
		alignOrientation.MaxTorque = math.huge;
		alignOrientation.Responsiveness = 200;
		alignOrientation.Mode = Enum.OrientationAlignmentMode.OneAttachment;
		alignOrientation.Attachment0 = rootRigAttachment;
		alignOrientation.Parent = modelRecord.new.model.PrimaryPart;
	}
};
export = system;

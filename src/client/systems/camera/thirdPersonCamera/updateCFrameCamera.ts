import { System, useEvent, World } from "@rbxts/matter";
import { Players, UserInputService, Workspace } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { Camera, HasWeapon, Model, Player, ViewModel } from "shared";
let alignOrientation: AlignOrientation | undefined;
let lastMousePosition: Vector3 | undefined;
let firstRunSystem = true;
let pitchAngle = 0;
let yawAngle = 0;
const system: System<[World, ClientState]> = (world, state) => {
	if (!Workspace.CurrentCamera) return;
	if (firstRunSystem) {
		firstRunSystem = false;
	}
	for (const [id, cameraRecord] of world.queryChanged(Camera)) {
		if (!world.contains(id)) continue;
		if (!cameraRecord.new) continue;
		// if (
		// 	cameraRecord.new.cameraMode === "ThirdPerson" &&
		// 	state.preferredInput === Enum.PreferredInput.KeyboardAndMouse
		// ) {
		// 	Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
		// } else {
		// 	Workspace.CurrentCamera.CameraType = Enum.CameraType.Custom;
		// }
		if (alignOrientation) {
			alignOrientation.Enabled = cameraRecord.new.cameraMode === "ThirdPerson";
		}
		const [player, playerModel] = world.get(id, Player, Model);
		if (!player || !playerModel) continue;
		if (player.player !== Players.LocalPlayer) continue;
		const head = playerModel.model.FindFirstChild("Head");
		if (!head || !head.IsA("BasePart")) continue;
		if (!alignOrientation) continue;
		if (cameraRecord.new.cameraMode !== "ThirdPerson") continue;
		Players.LocalPlayer.CameraMinZoomDistance = 50;
		if (cameraRecord.old?.cameraMode === "FirstPerson") {
			const viewModel = world.get(id, ViewModel);
			if (!viewModel) continue;
			const direction = viewModel.model.GetPivot().LookVector;
			pitchAngle = math.asin(direction.Y);
			yawAngle = math.atan2(-direction.X, -direction.Z);
			alignOrientation.CFrame = CFrame.Angles(0, yawAngle, 0);
			Workspace.CurrentCamera.CFrame = head.CFrame.mul(new CFrame(3, 1, 7));
		}
	}
	for (const [id, modelRecord] of world.queryChanged(Model)) {
		if (!world.contains(id)) continue;
		if (!modelRecord.new) continue;
		if (!modelRecord.new.model.PrimaryPart) continue;
		const [player, playerCamera] = world.get(id, Player, Camera);
		if (!player || !playerCamera) continue;
		if (player.player !== Players.LocalPlayer) continue;
		const rootRigAttachment = modelRecord.new.model.PrimaryPart.FindFirstChild("RootRigAttachment");
		if (!rootRigAttachment || !rootRigAttachment.IsA("Attachment")) continue;
		if (alignOrientation) alignOrientation.Destroy();
		alignOrientation = new Instance("AlignOrientation");
		alignOrientation.MaxTorque = math.huge;
		alignOrientation.Responsiveness = 200;
		alignOrientation.Mode = Enum.OrientationAlignmentMode.OneAttachment;
		alignOrientation.Attachment0 = rootRigAttachment;
		alignOrientation.Enabled = playerCamera.cameraMode === "ThirdPerson";
		alignOrientation.Parent = modelRecord.new.model.PrimaryPart;
	}
	for (const [, player, playerModel, , playerCamera] of world.query(Player, Model, HasWeapon, Camera)) {
		if (playerCamera.cameraMode !== "ThirdPerson") continue;
		if (player.player !== Players.LocalPlayer) continue;
		if (!alignOrientation) continue;
		const head = playerModel.model.FindFirstChild("Head");
		if (!head || !head.IsA("BasePart")) continue;
		const neck = playerModel.model.FindFirstChild("Head")?.FindFirstChild("Neck");
		if (!neck || !neck.IsA("Motor6D")) continue;
		if (!alignOrientation) continue;
		const leftShoulder = playerModel.model.FindFirstChild("LeftUpperArm")?.FindFirstChild("LeftShoulder");
		if (!leftShoulder || !leftShoulder.IsA("Motor6D")) continue;
		const rightShoulder = playerModel.model.FindFirstChild("RightUpperArm")?.FindFirstChild("RightShoulder");
		if (!rightShoulder || !rightShoulder.IsA("Motor6D")) continue;
		if (state.preferredInput === Enum.PreferredInput.KeyboardAndMouse) {
			for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, UserInputService.InputChanged)) {
				if (gameProcessedEvent) continue;
				if (input.UserInputType !== Enum.UserInputType.MouseMovement) continue;
				if (!lastMousePosition) {
					lastMousePosition = input.Position;
					continue;
				}
				const mouseDelta = input.Position.sub(lastMousePosition);
				lastMousePosition = input.Position;
				const sensitivity = 0.005;
				pitchAngle = math.clamp(pitchAngle - mouseDelta.Y * sensitivity, -math.rad(80), math.rad(80));
				yawAngle += -mouseDelta.X * sensitivity;
				const pitchRotation = CFrame.Angles(pitchAngle, 0, 0);
				neck.C0 = new CFrame(neck.C0.Position).mul(pitchRotation);
				leftShoulder.C0 = new CFrame(leftShoulder.C0.Position).mul(pitchRotation);
				rightShoulder.C0 = new CFrame(rightShoulder.C0.Position).mul(pitchRotation);
				alignOrientation.CFrame = CFrame.Angles(0, yawAngle, 0);
			}
			Workspace.CurrentCamera.CFrame = head.CFrame.mul(new CFrame(3, 1, 7));
		} else if (state.preferredInput === Enum.PreferredInput.Touch) {
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
	}
};
export = system;
/*
	KeyboardAndMouse + FirstPerson = InputChanged (Handled elsewhere...)
	KeyboardAndMouse + ThirdPerson = MousePosition (Handled here)
	Touch + FirstPerson = InputChanged (Handled here)
	Touch + ThirdPerson = InputChanged (Handled here)
*/

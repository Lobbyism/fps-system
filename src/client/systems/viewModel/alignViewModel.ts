import { System, useEvent, World } from "@rbxts/matter";
import { Players, RunService, UserInputService, Workspace } from "@rbxts/services";
import { Player, ViewModel } from "shared";
const RENDER_STEPPED_NAME = "Camera";
let isAiming = false;
let aimCFrame = new CFrame();
let previousCameraCFrame = new CFrame();
const system: System<[World]> = (world) => {
	for (const [_, player] of world.query(Player, ViewModel)) {
		if (player.player !== Players.LocalPlayer) continue;
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.MouseButton2) continue;
			isAiming = true;
		}
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputEnded")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.MouseButton2) continue;
			isAiming = false;
		}
	}
	for (const [id, viewModelRecord] of world.queryChanged(ViewModel)) {
		if (!world.contains(id)) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		RunService.UnbindFromRenderStep(RENDER_STEPPED_NAME);
		const viewModel = viewModelRecord.new;
		if (viewModel) {
			RunService.BindToRenderStep(RENDER_STEPPED_NAME, Enum.RenderPriority.Camera.Value, () => {
				if (!Workspace.CurrentCamera) return;
				const aimPart = viewModel.model.FindFirstChild("AimPart");
				if (!aimPart || !aimPart.IsA("BasePart") || !viewModel.model.PrimaryPart) return;
				aimCFrame = isAiming
					? aimCFrame.Lerp(aimPart.CFrame.ToObjectSpace(viewModel.model.PrimaryPart.CFrame), 0.1)
					: aimCFrame.Lerp(new CFrame(), 0.1);
				viewModel.model.PivotTo(Workspace.CurrentCamera.CFrame.mul(aimCFrame));

				const cameraBone = viewModel.model.FindFirstChild("CameraBone");
				if (!cameraBone || !cameraBone.IsA("BasePart")) return;
				const newCameraCFrame = cameraBone.CFrame.ToObjectSpace(viewModel.model.PrimaryPart.CFrame);
				const offset = newCameraCFrame.ToObjectSpace(previousCameraCFrame);
				Workspace.CurrentCamera.CFrame = Workspace.CurrentCamera.CFrame.mul(offset);
				previousCameraCFrame = newCameraCFrame;
			});
		}
	}
};
export = system;

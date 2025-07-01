import { System, useEvent, World } from "@rbxts/matter";
import { Players, RunService, UserInputService, Workspace } from "@rbxts/services";
import { Movement, Player, ViewModel } from "shared";
import { MovementState } from "shared/weapons";
const RENDER_STEPPED_NAME = "Camera";
let aimCFrame = new CFrame();
let previousCameraCFrame = new CFrame();
let currentSlideOffset = new Vector3();
const system: System<[World]> = (world) => {
	for (const [id, player, viewModel] of world.query(Player, ViewModel)) {
		if (player.player !== Players.LocalPlayer) continue;
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputBegan")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.MouseButton2) continue;
			world.insert(
				id,
				viewModel.patch({
					isAimingDownSights: true,
				}),
			);
		}
		for (const [_, input, gameProcessedEvent] of useEvent(UserInputService, "InputEnded")) {
			if (gameProcessedEvent) continue;
			if (input.UserInputType !== Enum.UserInputType.MouseButton2) continue;
			world.insert(
				id,
				viewModel.patch({
					isAimingDownSights: false,
				}),
			);
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
				const playerMovement = world.get(id, Movement);
				const aimPart = viewModel.model.FindFirstChild("AimPart");
				if (!aimPart || !aimPart.IsA("BasePart") || !viewModel.model.PrimaryPart) return;
				aimCFrame = viewModel.isAimingDownSights
					? aimCFrame.Lerp(aimPart.CFrame.ToObjectSpace(viewModel.model.PrimaryPart.CFrame), 0.1)
					: aimCFrame.Lerp(new CFrame(), 0.1);
				const slideOffsetTarget =
					playerMovement?.state === MovementState.Sliding ? new Vector3(0, -2.5, 0) : new Vector3();
				currentSlideOffset = currentSlideOffset.Lerp(slideOffsetTarget, 0.1);
				Workspace.CurrentCamera.CFrame = Workspace.CurrentCamera.CFrame.mul(new CFrame(currentSlideOffset));
				viewModel.model.PivotTo(Workspace.CurrentCamera.CFrame.mul(aimCFrame));
				const cameraBone = viewModel.model.FindFirstChild("CameraBone");
				if (!cameraBone || !cameraBone.IsA("BasePart")) return;
				const newCameraCFrame = cameraBone.CFrame.ToObjectSpace(viewModel.model.PrimaryPart.CFrame);
				const recoilOffset = newCameraCFrame.ToObjectSpace(previousCameraCFrame);
				Workspace.CurrentCamera.CFrame = Workspace.CurrentCamera.CFrame.mul(recoilOffset);
				previousCameraCFrame = newCameraCFrame;
			});
		}
	}
};
export = system;

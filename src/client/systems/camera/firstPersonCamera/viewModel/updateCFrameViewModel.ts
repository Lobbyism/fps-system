import { System, World } from "@rbxts/matter";
import { Players, RunService, Workspace } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { Movement, Player, ViewModel } from "shared";
import { MovementState } from "shared/weapons";
const RENDER_STEPPED_NAME = "Camera";
let previousCameraCFrame = new CFrame();
let aimOffset = new CFrame();
let slideOffset = new Vector3();
const system: System<[World, ClientState]> = (world, state) => {
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
				aimOffset = viewModel.isAimingDownSights
					? aimOffset.Lerp(aimPart.CFrame.ToObjectSpace(viewModel.model.PrimaryPart.CFrame), 0.1)
					: aimOffset.Lerp(new CFrame(), 0.1);
				const slideOffsetTarget =
					playerMovement?.state === MovementState.Sliding ? new Vector3(0, -2.5, 0) : new Vector3();
				slideOffset = slideOffset.Lerp(slideOffsetTarget, 0.1);
				Workspace.CurrentCamera.CFrame = Workspace.CurrentCamera.CFrame.mul(new CFrame(slideOffset));
				viewModel.model.PivotTo(Workspace.CurrentCamera.CFrame.mul(aimOffset));
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

import { System, World } from "@rbxts/matter";
import { Players, RunService, Workspace } from "@rbxts/services";
import { Player, ViewModel } from "shared";
const RENDER_STEPPED_NAME = "Camera";
const system: System<[World]> = (world) => {
	for (const [id, viewModelRecord] of world.queryChanged(ViewModel)) {
		if (!world.contains(id)) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		RunService.UnbindFromRenderStep(RENDER_STEPPED_NAME);
		if (viewModelRecord.new) {
			RunService.BindToRenderStep(RENDER_STEPPED_NAME, Enum.RenderPriority.Camera.Value, () => {
				if (!Workspace.CurrentCamera) return;
				viewModelRecord.new?.model.PivotTo(Workspace.CurrentCamera.CFrame);
			});
		}
	}
};
export = system;

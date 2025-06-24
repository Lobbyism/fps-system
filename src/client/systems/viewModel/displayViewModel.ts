import { System, World } from "@rbxts/matter";
import { Players, RunService } from "@rbxts/services";
import { HasWeapon, Player, ViewModel } from "shared";
const RENDER_STEP_NAME = "ShowFirstPersonArms";
const system: System<[World]> = (world) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const [player, viewModel] = world.get(id, Player, ViewModel);
		if (!player || !viewModel || player.player !== Players.LocalPlayer) continue;
		RunService.UnbindFromRenderStep(RENDER_STEP_NAME);
		if (!hasWeaponRecord.new) continue;
		RunService.BindToRenderStep(RENDER_STEP_NAME, Enum.RenderPriority.Camera.Value, () => {
			viewModel.model.GetDescendants().forEach((instance) => {
				if (!instance.IsA("BasePart")) return;
				instance.LocalTransparencyModifier = 0;
			});
		});
	}
	for (const [id, viewMoodelRecord] of world.queryChanged(ViewModel)) {
		if (!world.contains(id)) continue;
		const player = world.get(id, Player);
		if (!player || player.player !== Players.LocalPlayer) continue;
		RunService.UnbindFromRenderStep(RENDER_STEP_NAME);
		if (!viewMoodelRecord.new) continue;
		const viewModel = viewMoodelRecord.new;
		RunService.BindToRenderStep(RENDER_STEP_NAME, Enum.RenderPriority.Camera.Value, () => {
			viewModel.model.GetDescendants().forEach((instance) => {
				if (!instance.IsA("BasePart")) return;
				instance.LocalTransparencyModifier = 0;
			});
		});
	}
};
export = system;

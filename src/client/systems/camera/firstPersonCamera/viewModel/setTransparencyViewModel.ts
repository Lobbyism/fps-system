import { System, World } from "@rbxts/matter";
import { RunService } from "@rbxts/services";
import { Camera, ViewModel } from "shared";
const RENDER_STEPPED_NAME = "DisplayViewModel";
const showViewModel = (viewModel: ViewModel) => {
	RunService.BindToRenderStep(RENDER_STEPPED_NAME, Enum.RenderPriority.Camera.Value, () => {
		viewModel.model.GetDescendants().forEach((instance) => {
			if (!instance.IsA("BasePart")) return;
			instance.LocalTransparencyModifier = 0;
			instance.Transparency = 0;
		});
	});
};
const hideViewModel = (viewModel: ViewModel) => {
	viewModel.model.GetDescendants().forEach((instance) => {
		if (!instance.IsA("BasePart")) return;
		instance.LocalTransparencyModifier = 1;
		instance.Transparency = 1;
	});
};
const system: System<[World]> = (world: World) => {
	for (const [id, cameraRecord] of world.queryChanged(Camera)) {
		if (!world.contains(id)) continue;
		if (cameraRecord.old?.cameraMode !== "FirstPerson") continue;
		if (cameraRecord.new?.cameraMode === "FirstPerson") continue;
		const viewModel = world.get(id, ViewModel);
		if (!viewModel) continue;
		RunService.UnbindFromRenderStep(RENDER_STEPPED_NAME);
		hideViewModel(viewModel);
	}
	for (const [id, cameraRecord] of world.queryChanged(Camera)) {
		if (!world.contains(id)) continue;
		if (cameraRecord.old && cameraRecord.old.cameraMode === "FirstPerson") continue;
		if (cameraRecord.new?.cameraMode !== "FirstPerson") continue;
		const viewModel = world.get(id, ViewModel);
		if (!viewModel) continue;
		RunService.UnbindFromRenderStep(RENDER_STEPPED_NAME);
		showViewModel(viewModel);
	}
	for (const [id, viewModelRecord] of world.queryChanged(ViewModel)) {
		if (!world.contains(id)) continue;
		RunService.UnbindFromRenderStep(RENDER_STEPPED_NAME);
		if (!viewModelRecord.new) continue;
		const camera = world.get(id, Camera);
		if (!camera || camera.cameraMode !== "FirstPerson") continue;
		showViewModel(viewModelRecord.new);
	}
};
export = system;

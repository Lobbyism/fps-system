import { System, World } from "@rbxts/matter";
import { Players, RunService } from "@rbxts/services";
import { ClientState } from "client/client.client";
import { HasWeapon, Model, Player } from "shared";
const RENDER_STEP_NAME = "ShowFirstPersonArms";
const system: System<[World, ClientState]> = (world, state) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		const [player, playerModel] = world.get(id, Player, Model);
		if (!player || !playerModel || player.player !== Players.LocalPlayer) continue;
		if (!hasWeaponRecord.new) continue;
		if (!state.entityIdMap.get(tostring(hasWeaponRecord.new.serverId))) continue;
		const weaponModel = world.get(hasWeaponRecord.new.serverId, Model);
		if (!weaponModel) continue;
		RunService.UnbindFromRenderStep(RENDER_STEP_NAME);
		if (hasWeaponRecord.new) {
			RunService.BindToRenderStep(RENDER_STEP_NAME, Enum.RenderPriority.Camera.Value, () => {
				const visibleBodyPartNames = [
					"RightHand",
					"RightLowerArm",
					"RightUpperArm",
					"LeftHand",
					"LeftLowerArm",
					"LeftUpperArm",
				];
				const visibleBodyBaseParts = visibleBodyPartNames.mapFiltered((name) => {
					const instance = playerModel.model.FindFirstChild(name);
					if (!instance || !instance.IsA("BasePart")) return;
					return instance;
				});
				const visibleWeaponBaseParts = weaponModel.model
					.GetDescendants()
					.filter((instance): instance is BasePart => instance?.IsA("BasePart"));
				[...visibleBodyBaseParts, ...visibleWeaponBaseParts].forEach((basePart) => {
					basePart.LocalTransparencyModifier = 0;
				});
			});
		}
	}
};
export = system;

import { SystemStruct, World } from "@rbxts/matter";
import { Players, UserInputService, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import { HasWeapon, Model, Player } from "shared";
const isBasePart = t.instanceIsA("BasePart");
const isMotor = t.instanceIsA("Motor6D");
let defaultRightShoulderC0: CFrame | undefined = undefined;
const f = (character: Model, targetPosition: Vector3) => {
	const humanoid = character.FindFirstChildWhichIsA("Humanoid");
	if (!humanoid || !character.PrimaryPart) return;
	const head = character.FindFirstChild("Head");
	const upperTorso = character.FindFirstChild("UpperTorso");
	const neck = head?.FindFirstChild("Neck");
	if (!isBasePart(upperTorso) || !isBasePart(head) || !isMotor(neck)) return;
	const [rX, rY, rZ] = upperTorso.CFrame.ToObjectSpace(
		CFrame.lookAt(upperTorso.Position, targetPosition),
	).ToOrientation();
	neck.C0 = new CFrame(neck.C0.Position).mul(CFrame.fromOrientation(rX, rY, rZ));
	const rightUpperArm = character.FindFirstChild("RightUpperArm");
	const rightShoulder = rightUpperArm?.FindFirstChild("RightShoulder");
	if (!isBasePart(rightUpperArm) || !isMotor(rightShoulder)) return;
	defaultRightShoulderC0 = defaultRightShoulderC0 ?? rightShoulder.C0;
	rightShoulder.C0 = defaultRightShoulderC0.mul(CFrame.fromOrientation(rX, 0, 0));
};
const RAYCAST_DISTANCE = 1e5;
const system: SystemStruct<[World]> = {
	event: "preSimulation",
	system: (world) => {
		for (const [id, player, playerModel] of world.query(Player, Model, HasWeapon)) {
			if (!world.contains(id)) continue;
			if (player.player !== Players.LocalPlayer) continue;
			if (!Workspace.CurrentCamera) continue;
			const mouseLocation = UserInputService.GetMouseLocation();
			const rayFromViewportPoint = Workspace.CurrentCamera.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);
			const raycastParams = new RaycastParams();
			raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
			raycastParams.AddToFilter(playerModel.model);
			const raycastResult = Workspace.Raycast(
				rayFromViewportPoint.Origin,
				rayFromViewportPoint.Direction.Unit.mul(RAYCAST_DISTANCE),
				raycastParams,
			);
			const lookAtPosition = raycastResult
				? raycastResult.Position
				: rayFromViewportPoint.Origin.add(rayFromViewportPoint.Direction.mul(RAYCAST_DISTANCE));
			const characterPosition = playerModel.model.GetPivot().Position;
			const transformedLookAtPosition = new Vector3(lookAtPosition.X, characterPosition.Y, lookAtPosition.Z);
			playerModel.model.PivotTo(CFrame.lookAt(characterPosition, transformedLookAtPosition));
			f(playerModel.model, lookAtPosition);
		}
	},
};
export = system;

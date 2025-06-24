import { System, useDeltaTime, useThrottle, World } from "@rbxts/matter";
import { Workspace } from "@rbxts/services";
import { Aim, Ammo, HasWeapon, Model, Weapon } from "shared";
import { canReload, canShoot, Weapons, WeaponUsageState } from "shared/weapons";
const garbage = Workspace.WaitForChild("garbage");
const createPart = (position: Vector3, color: Color3, dt: number) => {
	const part = new Instance("Part");
	part.Shape = Enum.PartType.Ball;
	part.Color = color;
	part.Size = Vector3.one.mul(0.5);
	part.Anchored = true;
	part.CanCollide = false;
	part.Position = position;
	part.Parent = garbage;
	task.delay(dt, () => {
		part.Destroy();
	});
	return part;
};
const RAYCAST_DISTANCE = 50;
const system: System<[World]> = (world) => {
	for (const [id, model, hasWeapon, aim, ammo] of world.query(Model, HasWeapon, Aim, Ammo)) {
		if (!world.contains(hasWeapon.serverId)) continue;
		const [weapon, weaponModel] = world.get(hasWeapon.serverId, Weapon, Model);
		if (!weapon || !weaponModel) continue;
		if (hasWeapon.state !== WeaponUsageState.Shooting) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		if (!canShoot(weapon)) {
			world.insert(
				id,
				hasWeapon.patch({
					state: canReload(ammo, hasWeapon, weapon) ? WeaponUsageState.Reloading : WeaponUsageState.Idle,
				}),
			);
		}
		if (!useThrottle(1 / weaponInfo.fireRate, hasWeapon.serverId)) continue;
		world.insert(
			hasWeapon.serverId,
			weapon.patch({
				magazine: weapon.magazine - 1,
			}),
		);
		const raycastParams = new RaycastParams();
		raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
		raycastParams.AddToFilter(model.model);
		raycastParams.AddToFilter(garbage);
		// const raycastPart = createPart(new Vector3(), new Color3(1, 1, 1), useDeltaTime());
		// raycastPart.Size = new Vector3(0.25, 0.25, RAYCAST_DISTANCE);
		// raycastPart.Shape = Enum.PartType.Block;
		// raycastPart.CFrame = CFrame.lookAt(aim.origin, aim.origin.add(aim.direction)).mul(
		// 	new CFrame(0, 0, -raycastPart.Size.Z / 2),
		// );
		// createPart(aim.origin, new Color3(1, 0, 0), useDeltaTime());
		// createPart(aim.origin.add(aim.direction.Unit.mul(RAYCAST_DISTANCE)), new Color3(0, 1, 0), useDeltaTime());
		const raycastResult = Workspace.Raycast(aim.origin, aim.direction.Unit.mul(RAYCAST_DISTANCE), raycastParams);
		if (!raycastResult) continue;
		const humanoid = raycastResult.Instance.Parent?.FindFirstChildWhichIsA("Humanoid");
		if (!humanoid) continue;
		humanoid.TakeDamage(weaponInfo.damage * (raycastResult.Instance.Name === "Head" ? 1.5 : 1));
		print(`Hit ${raycastResult.Instance.Name === "Head" ? "head" : "body"}`);
	}
};
export = system;

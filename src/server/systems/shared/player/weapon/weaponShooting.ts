import { System, useThrottle, World } from "@rbxts/matter";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Aim, Ammo, HasWeapon, Model, Player, Weapon, WEAPON_REMOTE } from "shared";
import { canReload, canShoot, Weapons, WeaponUsageState } from "shared/weapons";
const garbage = Workspace.WaitForChild("garbage");
const weaponRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(WEAPON_REMOTE.name) as RemoteEvent;
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
const RAYCAST_DISTANCE = 1000;
const system: System<[World]> = (world) => {
	for (const [id, player, model, hasWeapon, aim, ammo] of world.query(Player, Model, HasWeapon, Aim, Ammo)) {
		if (!world.contains(hasWeapon.serverId)) continue;
		const [weapon, weaponModel] = world.get(hasWeapon.serverId, Weapon, Model);
		if (!weapon || !weaponModel) continue;
		if (hasWeapon.state !== WeaponUsageState.Shooting) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		if (!canShoot(weapon)) {
			if (canReload(ammo, hasWeapon, weapon)) {
				world.insert(
					id,
					hasWeapon.patch({
						state: WeaponUsageState.Reloading,
					}),
				);
			} else {
				world.insert(
					id,
					hasWeapon.patch({
						state: WeaponUsageState.Idle,
					}),
				);
			}
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
		const raycastPart = createPart(new Vector3(), new Color3(1, 1, 1), 1 / weaponInfo.fireRate);
		raycastPart.Size = new Vector3(0.25, 0.25, RAYCAST_DISTANCE);
		raycastPart.Shape = Enum.PartType.Block;
		raycastPart.CFrame = CFrame.lookAt(aim.origin, aim.origin.add(aim.direction)).mul(
			new CFrame(0, 0, -raycastPart.Size.Z / 2),
		);
		createPart(aim.origin, new Color3(1, 0, 0), 1 / weaponInfo.fireRate);
		createPart(
			aim.origin.add(aim.direction.Unit.mul(RAYCAST_DISTANCE)),
			new Color3(0, 1, 0),
			1 / weaponInfo.fireRate,
		);
		const raycastResult = Workspace.Raycast(aim.origin, aim.direction.Unit.mul(RAYCAST_DISTANCE), raycastParams);
		if (!raycastResult) continue;
		const humanoid = raycastResult.Instance.Parent?.FindFirstChildWhichIsA("Humanoid");
		if (!humanoid) continue;
		const isCritical = raycastResult.Instance.Name === "Head";
		const damageAmount = (isCritical ? 1.5 : 1) * weaponInfo.damage;
		humanoid.TakeDamage(damageAmount);
		weaponRemoteEvent.FireClient(player.player, {
			type: WEAPON_REMOTE.payloads.damageFeedback,
			damageAmount: damageAmount,
			hitInstance: raycastResult.Instance,
			isCritical: isCritical,
		});
		// print(`Hit ${raycastResult.Instance.Name === "Head" ? "head" : "body"}`);
	}
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		if (hasWeaponRecord.new?.state === WeaponUsageState.Shooting) continue;
		if (hasWeaponRecord.old?.state !== WeaponUsageState.Shooting) continue;
		world.remove(id, Aim);
	}
};
export = system;

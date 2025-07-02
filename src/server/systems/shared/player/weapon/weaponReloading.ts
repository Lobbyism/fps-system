import { None, System, World } from "@rbxts/matter";
import { Ammo, HasWeapon, Weapon } from "shared";
import { reload, Weapons, WeaponUsageState } from "shared/weapons";
const system: System<[World]> = (world) => {
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!world.contains(id)) continue;
		if (!hasWeaponRecord.new) continue;
		if (hasWeaponRecord.new.state !== WeaponUsageState.Reloading) continue;
		if (!hasWeaponRecord.old || hasWeaponRecord.old.state === WeaponUsageState.Reloading) continue;
		if (!world.contains(hasWeaponRecord.new.serverId)) continue;
		const ammo = world.get(id, Ammo);
		if (!ammo) continue;
		const weapon = world.get(hasWeaponRecord.new.serverId, Weapon);
		if (!weapon) continue;
		const weaponInfo = Weapons.get(weapon.name);
		if (!weaponInfo) continue;
		let reloadCancelled = false;
		world.insert(
			id,
			hasWeaponRecord.new.patch({
				cancelReload: () => {
					reloadCancelled = true;
				},
			}),
		);
		const weaponId = hasWeaponRecord.new.serverId;
		task.delay(weaponInfo.reloadTime, () => {
			if (reloadCancelled) return;
			if (!world.contains(id) || !world.contains(weaponId)) return;
			const weapon = world.get(weaponId, Weapon);
			const hasWeapon = world.get(id, HasWeapon);
			if (!weapon || !hasWeapon || hasWeapon.serverId !== weaponId) return;
			const [updatedAmmo, updatedWeapon] = reload(ammo, weapon);
			world.insert(
				id,
				updatedAmmo,
				hasWeapon.patch({
					state: WeaponUsageState.Idle,
					cancelReload: None,
				}),
			);
			world.insert(weaponId, updatedWeapon);
		});
	}
	for (const [id, hasWeaponRecord] of world.queryChanged(HasWeapon)) {
		if (!hasWeaponRecord.old) continue;
		if (!hasWeaponRecord.new) continue;
		if (hasWeaponRecord.old.state !== WeaponUsageState.Reloading) continue;
		if (hasWeaponRecord.new.state === WeaponUsageState.Reloading) continue;
		if (!hasWeaponRecord.old.cancelReload) continue;
		hasWeaponRecord.old.cancelReload();
	}
};
export = system;

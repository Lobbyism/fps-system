import { System, useEvent, World } from "@rbxts/matter";
import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import { ClientState } from "client/client.client";
import { Aim, Ammo, HasWeapon, Player, WEAPON_REMOTE, Weapon } from "shared";
import { canReload, canShoot, reload, Weapons, WeaponUsageState } from "shared/weapons";
const weaponRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(WEAPON_REMOTE.name) as RemoteEvent;
const startShootingCheck = t.strictInterface({
	type: t.literal(WEAPON_REMOTE.payloads.startShooting),
	origin: t.Vector3,
	direction: t.Vector3,
});
const stopShootingCheck = t.strictInterface({
	type: t.literal(WEAPON_REMOTE.payloads.stopShooting),
});
const updateAimCheck = t.strictInterface({
	type: t.literal(WEAPON_REMOTE.payloads.updateAim),
	origin: t.Vector3,
	direction: t.Vector3,
});
const reloadCheck = t.strictInterface({
	type: t.literal(WEAPON_REMOTE.payloads.reload),
});
const system: System<[World, ClientState]> = (world) => {
	for (const [_, requestPlayer, request] of useEvent(weaponRemoteEvent, "OnServerEvent")) {
		for (const [id, player, hasWeapon, ammo] of world.query(Player, HasWeapon, Ammo)) {
			if (requestPlayer !== player.player) continue;
			if (!world.contains(hasWeapon.serverId)) continue;
			const weapon = world.get(hasWeapon.serverId, Weapon);
			if (!weapon) continue;
			const weaponInfo = Weapons.get(weapon.name);
			if (!weaponInfo) continue;
			if (startShootingCheck(request)) {
				world.insert(
					id,
					hasWeapon.patch({
						state: canShoot(weapon)
							? WeaponUsageState.Shooting
							: canReload(ammo, hasWeapon, weapon)
								? WeaponUsageState.Reloading
								: WeaponUsageState.Idle,
					}),
				);
			} else if (updateAimCheck(request) && canShoot(weapon)) {
				world.insert(id, Aim({ origin: request.origin, direction: request.direction }));
			} else if (stopShootingCheck(request)) {
				if (hasWeapon.state !== WeaponUsageState.Shooting) continue;
				world.insert(id, hasWeapon.patch({ state: WeaponUsageState.Idle }));
			} else if (reloadCheck(request) && canReload(ammo, hasWeapon, weapon)) {
				world.insert(
					id,
					hasWeapon.patch({
						state: WeaponUsageState.Reloading,
					}),
				);
			}
		}
	}
};
export = system;

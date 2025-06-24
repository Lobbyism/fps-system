import { Ammo, HasWeapon, Weapon } from "./components";
export enum WeaponUsageState {
	Idle = "Idle",
	Shooting = "Shooting",
	Reloading = "Reloading",
}
export type WeaponInfo = {
	damage: number;
	fireRate: number;
	magazineSize: number;
	name: string;
	reloadTime: number;
	reserveAmmo: number;
};
export const Weapons = new Map<string, WeaponInfo>([
	[
		"M16A4",
		{
			damage: 0.05,
			fireRate: 9,
			magazineSize: 30,
			name: "M16A4",
			reloadTime: 1.5,
			reserveAmmo: 90,
		},
	],
]);
export const canShoot = (weapon: Weapon) => weapon.magazine > 0;
export const canReload = (ammo: Ammo, hasWeapon: HasWeapon, weapon: Weapon) => {
	if (hasWeapon.state === WeaponUsageState.Reloading) return false;
	const weaponInfo = Weapons.get(weapon.name);
	if (!weaponInfo) return false;
	return ammo.reserve > 0 && weapon.magazine !== weaponInfo.magazineSize;
};
export const shoot = (weapon: Weapon) => {
	return weapon.patch({ magazine: weapon.magazine - 1 });
};
export const reload = (ammo: Ammo, weapon: Weapon): [Ammo, Weapon] => {
	const weaponInfo = Weapons.get(weapon.name);
	if (!weaponInfo) return [ammo, weapon];
	const roundsMissing = weaponInfo.magazineSize - weapon.magazine;
	const roundsToReload = math.min(roundsMissing, ammo.reserve);
	return [
		ammo.patch({ reserve: ammo.reserve - roundsToReload }),
		weapon.patch({ magazine: weapon.magazine + roundsToReload }),
	];
};

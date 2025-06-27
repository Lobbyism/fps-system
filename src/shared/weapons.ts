import { Ammo, HasWeapon, Weapon } from "./components";
export const WeaponUsageState = {
	Idle: "Idle",
	Shooting: "Shooting",
	Reloading: "Reloading",
} as const;
export type WeaponUsageState = (typeof WeaponUsageState)[keyof typeof WeaponUsageState];
export const MovementState = {
	Idle: "Idle",
	Running: "Running",
	Sliding: "Sliding",
} as const;
export type MovementState = (typeof MovementState)[keyof typeof MovementState];
export const WeaponAnimationNames = {
	fire: "Fire",
} as const;
export type WeaponAnimationName = keyof typeof WeaponAnimationNames;
export type WeaponInfo = {
	animationIds: {
		viewModel: {
			[WeaponUsageState.Shooting]: string;
			[MovementState.Sliding]: string;
			[MovementState.Running]: string;
		};
		character: {
			[WeaponUsageState.Idle]: string;
		};
	};
	damage: number;
	fireRate: number;
	magazineSize: number;
	name: string;
	reloadTime: number;
	reserveAmmo: number;
	spreadAngle: number;
};
export const Weapons = new Map<string, WeaponInfo>([
	[
		"M16A4",
		{
			animationIds: {
				viewModel: {
					[WeaponUsageState.Shooting]: "119598271412864",
					[MovementState.Sliding]: "79994438112815",
					[MovementState.Running]: "112857441561315",
				},
				character: {
					[WeaponUsageState.Idle]: "115274717768824",
				},
			},
			damage: 10,
			fireRate: 9,
			magazineSize: 30,
			name: "M16A4",
			reloadTime: 1.5,
			reserveAmmo: 90,
			spreadAngle: 1,
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

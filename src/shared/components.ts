import { AnyEntity } from "@rbxts/matter";
import { GenericOfComponent, newComponent } from "@rbxts/matter/lib/component";
import { WeaponUsageState } from "./weapons";
export const Model = newComponent<{ model: Model }>("Model");
export const Player = newComponent<{ player: Player }>("Player");
export const Ammo = newComponent<{ reserve: number }>("Ammo");
export type Ammo = ReturnType<typeof Ammo>;
export const Weapon = newComponent<{
	magazine: number;
	name: string;
}>("Weapon");
export type Weapon = ReturnType<typeof Weapon>;
export const Aim = newComponent<{
	origin: Vector3;
	direction: Vector3;
}>("Aim");
export const HasWeapon = newComponent<{ serverId: AnyEntity; state: WeaponUsageState; cancelReload?: () => void }>(
	"HasWeapon",
);
export type HasWeapon = ReturnType<typeof HasWeapon>;
export const ViewModel = newComponent<{ model: Model }>("ViewModel");
export const components = { Model, Player, Weapon, HasWeapon, Aim, ViewModel, Ammo };
export type ComponentNames = keyof typeof components;
export type ComponentsMap = { [K in ComponentNames]: MappedComponentToName<K> };
export type MappedComponentToName<T extends ComponentNames> = GenericOfComponent<ReturnType<(typeof components)[T]>>;
export type UnionComponentsMap = ComponentsMap[ComponentNames];

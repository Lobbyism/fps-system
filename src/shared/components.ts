import { AnyEntity, Entity } from "@rbxts/matter";
import { GenericOfComponent, newComponent } from "@rbxts/matter/lib/component";
export const Model = newComponent<{ model: Model }>("Model");
export const Player = newComponent<{ player: Player }>("Player");
export const Weapon = newComponent<{
	name: string;
	isShooting: boolean;
}>("Weapon");
export const Aim = newComponent<{
	origin: Vector3;
	direction: Vector3;
}>("Aim");
export const HasWeapon = newComponent<{ serverId: AnyEntity }>("HasWeapon");
export const ViewModel = newComponent<{ model: Model }>("ViewModel");
export const components = { Model, Player, Weapon, HasWeapon, Aim, ViewModel };
export type ComponentNames = keyof typeof components;
export type ComponentsMap = { [K in ComponentNames]: MappedComponentToName<K> };
export type MappedComponentToName<T extends ComponentNames> = GenericOfComponent<ReturnType<(typeof components)[T]>>;
export type UnionComponentsMap = ComponentsMap[ComponentNames];

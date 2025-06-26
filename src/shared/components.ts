import { AnyEntity } from "@rbxts/matter";
import { GenericOfComponent, newComponent } from "@rbxts/matter/lib/component";
import { MovementState, WeaponUsageState } from "./weapons";
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
export const HasWeapon = newComponent<
	{ serverId: AnyEntity; cancelReload?: () => void } & (
		| {
				animationTrack?: AnimationTrack;
				state: typeof WeaponUsageState.Shooting;
		  }
		| {
				state: typeof WeaponUsageState.Reloading;
		  }
		| {
				animationTrack?: AnimationTrack;
				state: typeof WeaponUsageState.Idle;
		  }
	)
>("HasWeapon");
export type HasWeapon = ReturnType<typeof HasWeapon>;
export const ViewModel = newComponent<{ isAimingDownSights: boolean; model: Model }>("ViewModel");
export type ViewModel = ReturnType<typeof ViewModel>;
export const Movement = newComponent<{
	state: MovementState;
	startTime: DateTime;
	initialVelocity: Vector3;
	linearVelocity: LinearVelocity;
	animationTrack: AnimationTrack;
}>("Movement");
export const components = { Model, Player, Weapon, HasWeapon, Aim, ViewModel, Ammo };
export type ComponentNames = keyof typeof components;
export type ComponentsMap = { [K in ComponentNames]: MappedComponentToName<K> };
export type MappedComponentToName<T extends ComponentNames> = GenericOfComponent<ReturnType<(typeof components)[T]>>;
export type UnionComponentsMap = ComponentsMap[ComponentNames];

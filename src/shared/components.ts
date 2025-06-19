import { GenericOfComponent, newComponent } from "@rbxts/matter/lib/component";
export const Model = newComponent<{ model: Model }>("Model");
export const Player = newComponent<{ player: Player }>("Player");
export const components = { Model, Player };
export type ComponentNames = keyof typeof components;
export type ComponentsMap = { [K in ComponentNames]: MappedComponentToName<K> };
export type MappedComponentToName<T extends ComponentNames> = GenericOfComponent<ReturnType<(typeof components)[T]>>;
export type UnionComponentsMap = ComponentsMap[ComponentNames];

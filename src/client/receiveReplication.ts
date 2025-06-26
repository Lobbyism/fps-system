import { AnyComponent, AnyEntity, component, World } from "@rbxts/matter";
import { ComponentCtor } from "@rbxts/matter/lib/component";
import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import { ComponentNames, components, UnionComponentsMap } from "shared/components";
import { ClientState } from "./client.client";

const remoteEvent = ReplicatedStorage.WaitForChild("Replication") as RemoteEvent;

export function receiveReplication(world: World, state: ClientState): void {
	const entityIdMap = state.entityIdMap;
	const reverseEntityIdMap = state.reverseEntityIdMap;

	remoteEvent.OnClientEvent.Connect((entities: Map<string, Map<ComponentNames, { data?: UnionComponentsMap }>>) => {
		assert(t.map(t.string, t.table)(entities));

		for (const [serverEntityId, componentMap] of entities) {
			let clientEntityId = entityIdMap.get(serverEntityId);

			if (clientEntityId !== undefined && next(componentMap)[0] === undefined) {
				world.despawn(clientEntityId);
				entityIdMap.delete(serverEntityId);
				reverseEntityIdMap.delete(clientEntityId);
				continue;
			}

			const componentsToInsert = new Array<AnyComponent>();
			const componentsToRemove = new Array<ComponentCtor>();
			const insertNames = new Array<string>();
			const removeNames = new Array<string>();
			// Patch-or-insert logic:
			// If the client already has an entity with this component, apply the incoming data via `.patch()` to preserve existing local state.
			// Otherwise, construct a new component. This prevents overwriting client-side data while still keeping components in sync with the server.
			for (const [name, container] of componentMap) {
				if (container.data !== undefined) {
					const componentCtor = components[name];
					let component: AnyComponent;
					if (clientEntityId !== undefined) {
						const existing = world.get(clientEntityId, componentCtor);
						if (existing !== undefined) {
							component = (existing as AnyComponent).patch(container.data);
						} else {
							component = componentCtor(container.data as never);
						}
					} else {
						component = componentCtor(container.data as never);
					}
					componentsToInsert.push(component);
					insertNames.push(name);
				} else {
					componentsToRemove.push(components[name]);
					removeNames.push(name);
				}
			}
			// Previous behavior
			// for (const [name, container] of componentMap) {
			// 	if (container.data !== undefined) {
			// 		componentsToInsert.push(
			// 			components[name](container.data as UnionToIntersection<UnionComponentsMap>),
			// 		);
			// 		insertNames.push(name);
			// 	} else {
			// 		componentsToRemove.push(components[name]);
			// 		removeNames.push(name);
			// 	}
			// }

			if (clientEntityId === undefined) {
				clientEntityId = world.spawn(...componentsToInsert);

				entityIdMap.set(serverEntityId, clientEntityId);
				reverseEntityIdMap.set(clientEntityId, serverEntityId);
			} else {
				if (componentsToInsert.size() > 0) {
					world.insert(clientEntityId, ...componentsToInsert);
				}

				if (componentsToRemove.size() > 0) {
					world.remove(clientEntityId, ...componentsToRemove);
				}
			}
		}
	});
}

import { System, useEvent, World } from "@rbxts/matter";
import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import { ClientState } from "client/client.client";
import { Aim, HasWeapon, Player, SHOOT_REMOTE, Weapon } from "shared";
const shootRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(SHOOT_REMOTE.name) as RemoteEvent;
const startShootingCheck = t.strictInterface({
	type: t.literal(SHOOT_REMOTE.payloads.start),
	origin: t.Vector3,
	direction: t.Vector3,
});
const stopShootingCheck = t.strictInterface({
	type: t.literal(SHOOT_REMOTE.payloads.stop),
});
const updateShootingCheck = t.strictInterface({
	type: t.literal(SHOOT_REMOTE.payloads.update),
	origin: t.Vector3,
	direction: t.Vector3,
});
const system: System<[World, ClientState]> = (world) => {
	for (const [_, requestPlayer, request] of useEvent(shootRemoteEvent, "OnServerEvent")) {
		for (const [id, player, hasWeapon] of world.query(Player, HasWeapon)) {
			if (requestPlayer !== player.player) continue;
			if (!world.contains(hasWeapon.serverId)) continue;
			const weapon = world.get(hasWeapon.serverId, Weapon);
			if (!weapon) continue;
			if (startShootingCheck(request)) {
				world.insert(hasWeapon.serverId, weapon.patch({ isShooting: true }));
				world.insert(id, Aim({ origin: request.origin, direction: request.direction }));
			} else if (updateShootingCheck(request)) {
				world.insert(id, Aim({ origin: request.origin, direction: request.direction }));
			} else if (stopShootingCheck(request)) {
				world.insert(hasWeapon.serverId, weapon.patch({ isShooting: false }));
			}
		}
	}
};
export = system;

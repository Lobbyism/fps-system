import { useEvent } from "@rbxts/matter";
import React from "@rbxts/react";
import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import { WEAPON_REMOTE } from "shared/global-events";
import { UIRenderer, UIUpdater } from "..";
import { DamageFeedback } from "client/gui/components/DamageFeedbacks";
export interface DamageFeedback {
	damageAmount: number;
	hitInstance: Instance;
	id: number;
	isCritical: boolean;
	startedAt: DateTime;
}
const DAMAGE_FEEDBACK_LIFETIME = 1.5;
const weaponRemoteEvent = ReplicatedStorage.WaitForChild("remotes").WaitForChild(WEAPON_REMOTE.name) as RemoteEvent;
const damageFeedbackRequestCheck = t.interface({
	type: t.literal(WEAPON_REMOTE.payloads.damageFeedback),
	damageAmount: t.number,
	hitInstance: t.Instance,
	isCritical: t.boolean,
});
const damageFeedbacks: DamageFeedback[] = [];
let nextDamageFeedbackId = 1;
export const damageFeedbackUpdater: UIUpdater = (_) => {
	let stateChanged = false;
	const currentDateTime = DateTime.now();
	for (let i = damageFeedbacks.size() - 1; i >= 0; i--) {
		if (currentDateTime.UnixTimestamp - damageFeedbacks[i].startedAt.UnixTimestamp > DAMAGE_FEEDBACK_LIFETIME) {
			damageFeedbacks.remove(i);
			stateChanged = true;
		}
	}
	for (const [_, request] of useEvent(weaponRemoteEvent, "OnClientEvent")) {
		if (!damageFeedbackRequestCheck(request)) continue;
		damageFeedbacks.push({
			...request,
			id: nextDamageFeedbackId,
			startedAt: DateTime.now(),
		});
		nextDamageFeedbackId = nextDamageFeedbackId + 1;
		stateChanged = true;
	}
	return stateChanged;
};
export const damageFeedbackRenderer: UIRenderer = (_) => {
	return (
		<>
			{damageFeedbacks.mapFiltered((damageFeedback) =>
				damageFeedback.hitInstance.Parent?.IsA("PVInstance") ? (
					<DamageFeedback
						damageAmount={damageFeedback.damageAmount}
						hitInstanceParent={damageFeedback.hitInstance.Parent}
						isCritical={damageFeedback.isCritical}
						key={`DamageFeedback${damageFeedback.id}`}
					/>
				) : undefined,
			)}
		</>
	);
};

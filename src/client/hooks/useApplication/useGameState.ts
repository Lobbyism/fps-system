import { World } from "@rbxts/matter";
import { UIUpdater } from ".";
import { damageFeedbackUpdater } from "./elements/damageFeedback";
import { crosshairUpdater } from "./elements/crosshair";
import { touchButtonsUpdater } from "./elements/touchButtons";
import { ClientState } from "client/client.client";
export interface GameState {}
const updaters: UIUpdater[] = [damageFeedbackUpdater, crosshairUpdater, touchButtonsUpdater];
let gameUserInterfaceState: GameState = {};
export const useGameUserInterface = (world: World, state: ClientState): [boolean, GameState] => {
	let stateChanged = false;
	if (!state) {
		gameUserInterfaceState = {};
	}
	updaters.forEach((updater) => {
		if (updater(world, state, gameUserInterfaceState)) {
			stateChanged = true;
		}
	});
	return [stateChanged, gameUserInterfaceState];
};

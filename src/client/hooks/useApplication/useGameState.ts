import { World } from "@rbxts/matter";
import { UIUpdater } from ".";
import { damageFeedbackUpdater } from "./elements/damageFeedback";
import { crosshairUpdater } from "./elements/crosshair";
export interface GameState {}
const updaters: UIUpdater[] = [damageFeedbackUpdater, crosshairUpdater];
let state: GameState = {};
export const useGameState = (world: World): [boolean, GameState] => {
	let stateChanged = false;
	if (!state) {
		state = {};
	}
	updaters.forEach((updater) => {
		if (updater(world, state)) {
			stateChanged = true;
		}
	});
	return [stateChanged, state];
};

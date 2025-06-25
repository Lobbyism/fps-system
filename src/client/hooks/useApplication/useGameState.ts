import { World } from "@rbxts/matter";
import { UIUpdater } from ".";
import { damageFeedbackUpdater } from "./elements/damageFeedback";
export interface GameState {}
const updaters: UIUpdater[] = [damageFeedbackUpdater];
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

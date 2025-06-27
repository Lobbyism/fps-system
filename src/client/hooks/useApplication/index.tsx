import { useHookState, World } from "@rbxts/matter";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { GameState, useGameState } from "./useGameState";
import { damageFeedbackRenderer } from "./elements/damageFeedback";
import { crosshairRenderer } from "./elements/crosshair";
const cleanup = (storage: unknown) => {
	return true;
};
export type UIUpdater = (world: World, state: GameState) => boolean;
export type UIRenderer = (world: World, state: GameState) => React.Element | undefined;
export const useApplication = (world: World) => {
	const storage = useHookState<{
		handle: ReactRoblox.Root;
	}>("application", cleanup);
	if (!storage.handle) {
		const container = new Instance("ScreenGui");
		container.IgnoreGuiInset = true;
		container.ResetOnSpawn = false;
		container.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
		container.Name = "React";
		container.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
		storage.handle = ReactRoblox.createRoot(container);
	}
	const [stateChanged, gameState] = useGameState(world);
	if (stateChanged) {
		storage.handle.render(
			<>
				{damageFeedbackRenderer(world, gameState)}
				{crosshairRenderer(world, gameState)}
			</>,
		);
	}
};

import { useHookState, World } from "@rbxts/matter";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { GameState, useGameUserInterface } from "./useGameState";
import { damageFeedbackRenderer } from "./elements/damageFeedback";
import { crosshairRenderer } from "./elements/crosshair";
import { touchButtonsRenderer } from "./elements/touchButtons";
import { ClientState } from "client/client.client";
const cleanup = (storage: unknown) => {
	return true;
};
export type UIUpdater = (world: World, state: ClientState, gameUserInterfaceState: GameState) => boolean;
export type UIRenderer = (
	world: World,
	state: ClientState,
	gameUserInterfaceState: GameState,
) => React.Element | undefined;
export const useApplication = (world: World, state: ClientState) => {
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
	const [stateChanged, gameUserInterfaceState] = useGameUserInterface(world, state);
	if (stateChanged) {
		storage.handle.render(
			<>
				{damageFeedbackRenderer(world, state, gameUserInterfaceState)}
				{crosshairRenderer(world, state, gameUserInterfaceState)}
				{touchButtonsRenderer(world, state, gameUserInterfaceState)}
			</>,
		);
	}
};

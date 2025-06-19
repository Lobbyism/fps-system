import { RunService } from "@rbxts/services";

export const isStudio = !!RunService.IsStudio();

export const CurrentVersion = "0.1.0";


export const DEFAULT_WALK_SPEED = isStudio ? 64 : 16;


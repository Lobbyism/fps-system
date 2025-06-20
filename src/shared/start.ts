// https://github.com/Ukendio/for-animia/blob/master/src/shared/start.ts
import { Debugger, Loop, World, System } from "@rbxts/matter";
import { RunService, UserInputService } from "@rbxts/services";
import { Context, HotReloader } from "@rbxts/rewire";
import Plasma from "@rbxts/plasma";
import { Model } from "./components";
interface ClientState {
	debugEnabled: boolean;
}
export function start<S extends object>(
	containers: Array<Instance>,
	state: S,
): (...plugins: Array<(world: World, state: S) => void>) => World {
	const world = new World();

	type T = [World, S, Plasma.Widgets];
	const myDebugger = new Debugger<T>(Plasma);
	myDebugger.enabled = false;
	myDebugger.findInstanceFromEntity = (id): Model | undefined => {
		if (!world.contains(id)) return;

		const model = world.get(id, Model);

		return model ? model.model : undefined;
	};
	myDebugger.authorize = (player): boolean => {
		return [27820182].find((userId) => userId === player.UserId) ? true : false;
	};

	const loop = new Loop<T>(world, state, myDebugger.getWidgets());
	const hotReloader = new HotReloader();

	let firstRunSystems = new Array<System<T>>();
	let systemsByModule = new Map<ModuleScript, System<T>>();

	function loadModule(mod: ModuleScript, ctx: Context): void {
		const originalModule = ctx.originalModule;

		const [ok, system] = pcall(require, mod) as LuaTuple<[boolean, System<T>]>;

		if (!ok) {
			warn("Error when hot-reloading system", mod.Name, system);
			return;
		}

		if (firstRunSystems) {
			firstRunSystems.push(system);
		} else if (systemsByModule.has(originalModule)) {
			loop.replaceSystem(systemsByModule.get(originalModule)!, system);
			myDebugger.replaceSystem(systemsByModule.get(originalModule)!, system);
		} else loop.scheduleSystem(system);

		systemsByModule.set(originalModule, system);
	}

	function unloadModule(_: ModuleScript, ctx: Context): void {
		if (ctx.isReloading) return;

		const originalModule = ctx.originalModule;
		if (systemsByModule.has(originalModule)) {
			loop.evictSystem(systemsByModule.get(originalModule)!);
			systemsByModule.delete(originalModule);
		}
	}

	containers.forEach((container) => hotReloader.scan(container, loadModule, unloadModule));

	loop.scheduleSystems(firstRunSystems);
	firstRunSystems = undefined!;

	myDebugger.autoInitialize(loop);

	const events: {
		default: RBXScriptSignal;
		fixed?: RBXScriptSignal;
		preSimulation?: RBXScriptSignal;
	} = RunService.IsClient()
		? {
				default: RunService.RenderStepped,
				fixed: RunService.Heartbeat,
				preSimulation: RunService.PreSimulation,
			}
		: { default: RunService.Heartbeat };

	loop.begin(events);

	if (RunService.IsClient()) {
		(state as ClientState).debugEnabled = myDebugger.enabled;

		UserInputService.InputBegan.Connect((input) => {
			if (input.KeyCode === Enum.KeyCode.F4) {
				myDebugger.toggle();
				(state as ClientState).debugEnabled = myDebugger.enabled;
			}
		});
	}

	return function (...plugins: Array<(world: World, state: S) => void>): World {
		for (const plugin of plugins) {
			plugin(world, state);
		}

		return world;
	};
}

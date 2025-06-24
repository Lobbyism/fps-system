import { ServerScriptService } from "@rbxts/services";
import { start } from "shared/start";
import addRemotes from "./addRemotes";

// Eventually filter systems to consider with game.PlaceId
addRemotes();
start([ServerScriptService.TS.systems], {})();

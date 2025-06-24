import { ReplicatedStorage } from "@rbxts/services";
import { WEAPON_REMOTE } from "shared";
export = () => {
	const remoteEventNames = [WEAPON_REMOTE.name];
	const remotesFolder = new Instance("Folder");
	remotesFolder.Name = "remotes";
	remoteEventNames.forEach((remoteEventName) => {
		const remoteEvent = new Instance("RemoteEvent");
		remoteEvent.Name = remoteEventName;
		remoteEvent.Parent = remotesFolder;
	});
	remotesFolder.Parent = ReplicatedStorage;
};

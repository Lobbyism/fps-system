import { ReplicatedStorage } from "@rbxts/services";
import { SHOOT_REMOTE } from "shared";
export = () => {
	const remoteEventNames = [SHOOT_REMOTE.name];
	const remotesFolder = new Instance("Folder");
	remotesFolder.Name = "remotes";
	remoteEventNames.forEach((remoteEventName) => {
		const remoteEvent = new Instance("RemoteEvent");
		remoteEvent.Name = remoteEventName;
		remoteEvent.Parent = remotesFolder;
	});
	remotesFolder.Parent = ReplicatedStorage;
};

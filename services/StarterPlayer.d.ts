interface StarterPlayer {
	StarterPlayerScripts: StarterPlayerScripts & {
		TS: Folder & {
			systems: Folder & {
				cameraModes: Folder & {
					firstPerson: Folder;
					tirdPerson: Folder;
				};
			};
		};
	};
}

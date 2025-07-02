import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { TouchButtons } from ".";
export = function (target: Instance) {
	const handle = ReactRoblox.createRoot(new Instance("Folder"));
	handle.render(
		ReactRoblox.createPortal(
			<TouchButtons
				setTouchPressedWeaponUsageState={() => {}}
				setTouchPressedMovementState={() => {}}
				toggleCameraMode={() => {}}
			/>,
			target,
		),
	);
	return () => {
		handle.unmount();
	};
};

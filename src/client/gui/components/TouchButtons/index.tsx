import { usePx } from "client/gui/hooks";
import React = require("@rbxts/react");
import { WeaponUsageState } from "shared/weapons";
import { TouchPressedMovementState, TouchPressedWeaponUsageState } from "client/client.client";
interface TouchButtonProps extends React.InstanceProps<TextButton> {}
function TouchButton(props: TouchButtonProps) {
	const px = usePx();
	return (
		<textbutton AnchorPoint={new Vector2(1, 1)} TextSize={px(10)} {...props}>
			<uicorner CornerRadius={new UDim(1, 0)} />
		</textbutton>
	);
}
interface TouchButtonsProps {
	setTouchPressedWeaponUsageState: (weaponUsageState?: TouchPressedWeaponUsageState) => void;
	setTouchPressedMovementState: (movementState?: TouchPressedMovementState) => void;
}
export function TouchButtons(props: TouchButtonsProps) {
	// Note that sliding and aiming are states as opposed to events...
	const px = usePx();
	return (
		<frame key={"MobileButtons"} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
			<TouchButton
				Position={new UDim2(1, -px(18), 1, -px(15))}
				Size={UDim2.fromOffset(px(142), px(142))}
				Text={"Jump"}
				Event={{
					MouseButton1Down: () => {
						props.setTouchPressedMovementState("Jumping");
					},
				}}
			/>
			<TouchButton
				Position={new UDim2(1, -px(189), 1, -px(15))}
				Size={UDim2.fromOffset(px(121), px(121))}
				Text={"Crouch/Slide"}
				Event={{
					MouseButton1Down: () => {
						props.setTouchPressedMovementState("Sliding");
					},
				}}
			/>
			<TouchButton
				Position={new UDim2(1, -px(18), 1, -px(189))}
				Size={UDim2.fromOffset(px(121), px(121))}
				Text={"Aim"}
				Event={{
					MouseButton1Down: () => {
						print("Aim");
					},
				}}
			/>
			<TouchButton
				Position={new UDim2(1, -px(152), 1, -px(156))}
				Size={UDim2.fromOffset(px(121), px(121))}
				Text={"Shoot"}
				Event={{
					MouseButton1Down: () => props.setTouchPressedWeaponUsageState(WeaponUsageState.Shooting),
					MouseButton1Up: () => props.setTouchPressedWeaponUsageState(undefined),
				}}
			/>
			<TouchButton
				Position={new UDim2(1, -px(299), 1, -px(129))}
				Size={UDim2.fromOffset(px(79), px(79))}
				Text={"Reload"}
				Event={{
					MouseButton1Down: () => props.setTouchPressedWeaponUsageState(WeaponUsageState.Reloading),
					MouseButton1Up: () => props.setTouchPressedWeaponUsageState(undefined),
				}}
			/>
		</frame>
	);
}

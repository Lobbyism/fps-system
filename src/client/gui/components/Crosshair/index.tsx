import React = require("@rbxts/react");
export function Crosshair() {
	return (
		<frame BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={new Color3(1, 1, 1)}
				BorderSizePixel={0}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromOffset(1, 1)}
			></frame>
		</frame>
	);
}

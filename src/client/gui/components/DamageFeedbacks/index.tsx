import { DamageFeedback } from "client/hooks/useApplication/elements/damageFeedback";
import React = require("@rbxts/react");
import { useMotion } from "@rbxts/pretty-react-hooks";
import { useEffect } from "@rbxts/react";
interface DamageFeedbackProps {
	damageAmount: number;
	hitInstanceParent: PVInstance;
	isCritical: boolean;
}
export function DamageFeedback(props: DamageFeedbackProps) {
	const [studsOffsetWorldSpace, setStudsOffsetWorldSpace] = useMotion(new Vector3());
	const [textTransparency, setTextTransparency] = useMotion(0);
	useEffect(() => {
		setStudsOffsetWorldSpace.tween(
			new Vector3(
				(2 * math.random(0, 1) - 1) * math.random(1, 3),
				-2,
				(2 * math.random(0, 1) - 1) * math.random(1, 3),
			),
			{
				delayTime: 0.5,
				time: 1,
			},
		);
		setTextTransparency.tween(1, {
			delayTime: 0.5,
			time: 1,
		});
	}, []);
	return (
		<billboardgui
			Adornee={props.hitInstanceParent}
			AlwaysOnTop={true}
			Size={UDim2.fromScale(2, 1)}
			StudsOffsetWorldSpace={studsOffsetWorldSpace}
		>
			<textlabel
				BackgroundTransparency={1}
				Font={Enum.Font.LuckiestGuy}
				Size={UDim2.fromScale(1, 1)}
				Text={tostring(props.damageAmount)}
				TextColor3={props.isCritical ? new Color3(1, 0, 0) : new Color3(1, 1, 1)}
				TextScaled={true}
				TextTransparency={textTransparency}
			/>
		</billboardgui>
	);
}

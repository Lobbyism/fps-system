import React, { useEffect, useRef, useState } from "@rbxts/react";

export function useCooldown() {
	const [cooldown, setCooldown] = useState(0);
	const [maxCooldown, setMaxCooldown] = useState(1);
	const cooldownRef = useRef(0);

	useEffect(() => {
		cooldownRef.current = cooldown;
	}, [cooldown]);

	const startCooldown = (duration: number) => {
		setCooldown(duration);
		setMaxCooldown(duration > 0 ? duration : 1);
		cooldownRef.current = duration;

		const start = tick();
		let active = true;

		const loop = () => {
			if (!active) return;

			const elapsed = math.floor(tick() - start);
			const remaining = math.max(0, duration - elapsed);
			setCooldown(remaining);
			cooldownRef.current = remaining;

			if (remaining > 0) {
				task.delay(1, loop);
			}
		};

		loop();

		return () => {
			active = false;
		};
	};

	return {
		cooldown,
		maxCooldown,
		cooldownRef, // ← pour l’utiliser dans les callbacks
		startCooldown,
	};
}

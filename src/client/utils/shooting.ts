export const RAYCAST_DISTANCE = 1e5;
export const getSpreadDirection = (originPosition: Vector3, goalPosition: Vector3, spreadAngle: number) => {
	const basDirection = goalPosition.sub(originPosition);
	const baseCFrame = CFrame.lookAt(originPosition, originPosition.add(basDirection));
	const pitchOffset = math.rad((math.random() - 0.5) * 2 * spreadAngle);
	const yawOffset = math.rad((math.random() - 0.5) * 2 * spreadAngle);
	const offsetCFrame = baseCFrame.mul(CFrame.Angles(0, yawOffset, 0)).mul(CFrame.Angles(pitchOffset, 0, 0));
	return offsetCFrame.LookVector;
};

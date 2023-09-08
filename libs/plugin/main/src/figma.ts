import { createFigma } from "figma-api-stub";

const mockFigma: PluginAPI =
	figma ??
	createFigma({
		isWithoutTimeout: true,
		simulateErrors: false,
	});

export default mockFigma;

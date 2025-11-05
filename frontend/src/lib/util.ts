import { GAMECODE_MAX_LENGTH } from "./config";

export const generateGameCode = () => {
	return (
		Math.floor(Math.random() * 9 * 10 ** (GAMECODE_MAX_LENGTH - 1)) +
		1 * 10 ** (GAMECODE_MAX_LENGTH - 1)
	).toString();
};

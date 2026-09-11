import { SetsPicker } from "../components/SetsPicker";
import { getSetResults, resetQuestion, resetSet } from "./setsStorage";
import { shareSetViaWhatsApp } from "./shareSet";

interface Props {
	onPlay: (setId: number, onlyQuestionId?: number) => void;
	onBack: () => void;
}

// Set picker for "Who am I?" -- thin instantiation of the shared
// SetsPicker (see that file's own doc); this file owns nothing but
// which endpoint/copy/storage/share module belong to this mode.
export function TeammateSets({ onPlay, onBack }: Props) {
	return (
		<SetsPicker
			copy={{
				heading: "Who am I? — Sets",
				intro:
					"Eleven fixed sets of ten, ordered from well-known players to more obscure ones. Progress is saved on this device — come back and finish a set anytime, or retry a question you already answered.",
			}}
			fetchUrl="/api/teammates/sets"
			getSetResults={getSetResults}
			resetQuestion={resetQuestion}
			resetSet={resetSet}
			shareSetViaWhatsApp={shareSetViaWhatsApp}
			onPlay={onPlay}
			onBack={onBack}
		/>
	);
}

import { GameState } from "./GameState.js";

export class GameStateRepository {
    private version: string = "0.1.0";

    public save(gameState: GameState) {
        let payload = JSON.stringify(gameState);
        localStorage.setItem("save", payload)
        localStorage.setItem("save-version", this.version);
    }

    public load(): GameState {
        console.log("loading");
        const saved = localStorage.getItem("save")
        const version = localStorage.getItem("save-version")
        console.log("read from localstorage");
        if (saved === null || version === null) throw new Error("No save present");
        if (!this.compatible(version)) throw new Error(`${version} is not compatible with ${this.version}`);

        return JSON.parse(saved);
    }

    public savePresent() {
        const saved = localStorage.getItem("save")
        const version = localStorage.getItem("save-version")
        return saved !== null && version !== null;
    }

    deleteSave() {
        localStorage.removeItem("save");
        localStorage.removeItem("save-version");
    }

    compatible(readVersion: string): boolean {
        return readVersion == this.version;
    }
}

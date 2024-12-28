import { GameState } from "./GameState.js";

export class GameStateRepository {
    private version: string = "0.1.0";

    public save(id: number, gameState: GameState) {
        let payload = JSON.stringify(gameState);
        console.log(`Saving ${id} ${payload}`);
        localStorage.setItem("save-" + id, payload)
        localStorage.setItem("save-version-" + id, this.version);
    }

    public load(id: number): GameState {
        const saved = localStorage.getItem("save-" + id)
        console.log(`loading ${id} ${saved}`);
        const version = localStorage.getItem("save-version-" + id)
        console.log("read from localstorage");
        if (saved === null || version === null) throw new Error("No save present");
        if (!this.compatible(version)) throw new Error(`${version} is not compatible with ${this.version}`);

        return JSON.parse(saved);
    }

    public savePresent(id: number) {
        const saved = localStorage.getItem("save-" + id)
        const version = localStorage.getItem("save-version-" + id)
        return saved !== null && version !== null;
    }

    deleteSaves(ids: number[]) {
        localStorage.removeItem("save");
        localStorage.removeItem("save-version");

        for (const id of ids) {
            localStorage.removeItem("save-" + id);
            localStorage.removeItem("save-version-" + id);

        }
    }

    compatible(readVersion: string): boolean {
        return readVersion == this.version;
    }
}

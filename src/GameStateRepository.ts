import {GameState} from "./GameState.js";

export class GameStateRepository {
    public save(gameState: GameState) {
        let payload = JSON.stringify(gameState);
        localStorage.setItem("save", payload)
    }

    public load(): GameState {
        console.log("loading");
        const saved = localStorage.getItem("save")
        console.log("read from localstorage");
        if (saved === null) throw new Error("No save present");

        let parse = JSON.parse(saved);
        return parse;
    }

    public savePresent() {
        const saved = localStorage.getItem("save")
        return saved !== null;
    }
}

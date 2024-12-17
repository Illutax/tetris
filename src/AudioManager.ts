export class AudioManager {
    private readonly soundCache: Map<string, HTMLAudioElement> = new Map();

    private readonly soundsPath: string;
    private readonly musicPath: string;

    constructor(assetsPrefix: string) {
        this.soundsPath = assetsPrefix + "/sounds/";
        this.musicPath = assetsPrefix + "/music/";
    }

    public playSoundForAmountOfClearedLines(amountOfLines: number) {
        let sfxFile = this.getSoundForClearedAmountOfLines(amountOfLines);
        this.playSound(sfxFile);
    }

    public playPlop() {
        this.playSound("plop1.mp3");
    }

    public playSound(sfxFile: string) {
        if (!this.soundCache.has(sfxFile)) {
            console.error(`Sound wasn't preloaded: ${sfxFile}`);
            this.soundCache.set(sfxFile, new Audio(`${this.soundsPath}/${sfxFile}`));
        }
        let audio = this.soundCache.get(sfxFile)!;
        audio.playbackRate = 1 - (Math.random() / 7);
        audio!.play();
    }

    public playMusic(musicFile: string) {
        let audio = new Audio(`${this.musicPath}/${musicFile}`);
        audio.loop = true;
        audio.volume = 0.08;
        audio.play();
    }

    public preloadAllSounds(): void {
        for (let i = 1; i <= 4; i++) {
            const sfxFile = this.getSoundForClearedAmountOfLines(i);
            const audio = new Audio(`${this.soundsPath}/${sfxFile}`);
            audio.load();
            this.soundCache.set(sfxFile, audio);
        }
        const sfxFile = "plop1.mp3";
        const audio = new Audio(`${this.soundsPath}/${sfxFile}`);
        audio.load();
        this.soundCache.set(sfxFile, audio);
    }

    private getSoundForClearedAmountOfLines(linesCleared: number) {
        switch (linesCleared) {
            case 1:
                return "single.mp3";
            case 2:
                return "double.mp3";
            case 3:
                return "tripple.mp3";
            case 4:
                return "tetris.mp3";
            default:
                throw new Error("Unknown amount of clearedLines")
        }
    }

}
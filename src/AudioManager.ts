export class AudioManager {
    private readonly soundCache: Map<string, HTMLAudioElement> = new Map();

    constructor(private assetsPrefix: string) {
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
            this.soundCache.set(sfxFile, new Audio(`${this.assetsPrefix}/${sfxFile}`));
        }
        let audio = this.soundCache.get(sfxFile)!;
        const randomPitch = 1 - (Math.random()/7)
        audio.playbackRate = randomPitch;
        audio!.play();
    }

    public preloadAllSounds(): void {
        for (let i = 1; i <= 4; i++) {
            const sfxFile = this.getSoundForClearedAmountOfLines(i);
            const audio = new Audio(`${this.assetsPrefix}/${sfxFile}`);
            audio.load();
            this.soundCache.set(sfxFile, audio);
        }
        const sfxFile = "plop1.mp3";
        const audio = new Audio(`${this.assetsPrefix}/${sfxFile}`);
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
export class MathUtil {

    private constructor() {
    }

    /**
     * Returns a random integer value between min and max
     * @param min
     * @param max
     */
    public static randomRange(min: number, max: number): number {
        const d = max - min;
        return Math.floor(Math.random() * d) + min;
    }
}
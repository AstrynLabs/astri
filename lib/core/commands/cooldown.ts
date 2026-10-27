import { COOLDOWN_SWEEP_INTERVAL } from '../../constants';
import type { CooldownState } from '../../interfaces';
import type { CooldownLogic } from '../../types';

/** The default {@link CooldownLogic}. Cooldowns are kept in memory, so they are lost on restart and not shared between processes. */
export class CooldownHandler implements CooldownLogic {
    readonly #expiries = new Map<string, number>();
    #nextSweep = Date.now() + COOLDOWN_SWEEP_INTERVAL;

    getCooldown(userId: string, command: string): CooldownState {
        const key = `${userId}:${command}`;
        const expiry = this.#expiries.get(key);
        if (expiry === undefined) return { onCooldown: false, expiry: null };
        if (expiry <= Date.now()) {
            this.#expiries.delete(key);
            return { onCooldown: false, expiry: null };
        }
        return { onCooldown: true, expiry };
    }

    setCooldown(userId: string, command: string, expiry: number): void {
        const now = Date.now();
        if (now >= this.#nextSweep) {
            for (const [key, value] of this.#expiries) if (value <= now) this.#expiries.delete(key);
            this.#nextSweep = now + COOLDOWN_SWEEP_INTERVAL;
        }
        this.#expiries.set(`${userId}:${command}`, expiry);
    }
}

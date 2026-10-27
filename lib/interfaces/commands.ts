/** Whether a user is on cooldown for a command. */
export interface CooldownState {
    onCooldown: boolean;
    /** Unix ms the cooldown ends at, or `null` when not on cooldown. */
    expiry: number | null;
}

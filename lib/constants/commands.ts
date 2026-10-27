/** Separates the command name from the rest of a component or modal `custom_id`, e.g. `poll:vote:2`. */
export const CUSTOM_ID_SEPARATOR = ':';

/** Minimum ms between sweeps of expired entries in the default cooldown handler. */
export const COOLDOWN_SWEEP_INTERVAL = 60_000;

/** Why a `CommandClient` refused to run a command handler, or why one failed. */
export const CommandErrorTypes = {
    NotDeveloperGuild: 0,
    DeniedUser: 1,
    DeniedGuild: 2,
    MissingPermission: 3,
    OnCooldown: 4,
    MiddlewareError: 5,
    UncaughtError: 6
} as const;
export type CommandErrorTypes = (typeof CommandErrorTypes)[keyof typeof CommandErrorTypes];

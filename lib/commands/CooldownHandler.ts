export interface CooldownType {
  onCooldown: boolean;
  expiry: number | null;
}

/**
 * Cooldown Interface that needs to be implemented if you want to use a custom cooldown handler
 *
 * @export
 * @interface CooldownLogic
 */
export interface CooldownLogic {
  getCooldown: (user: string, command: string) => PromiseLike<CooldownType>;
  setCooldown: (user: string, command: string, expiry: number) => PromiseLike<boolean>;
}

/**
 * Default cooldown handler
 *
 * @export
 * @class CooldownHandler
 * @extends {Map<string, number>}
 * @implements {CooldownLogic}
 */
export class CooldownHandler extends Map<string, number> implements CooldownLogic {
  /**
   * Checks to see if a user is on cooldown for a command
   *
   * @param {string} user
   * @param {string} command
   * @return {*}
   * @memberof CooldownHandler
   */
  getCooldown(user: string, command: string) {
    const entry = this.get(`${user}:${command}`);
    if (entry) {
      if (entry <= Date.now()) {
        this.delete(`${user}:${command}`);
        return Promise.resolve({ onCooldown: false, expiry: null });
      } else return Promise.resolve({ onCooldown: true, expiry: entry });
    } else return Promise.resolve({ onCooldown: false, expiry: null });
  }

  /**
   * Sets a cooldown for a user on a command
   *
   * @param {string} user
   * @param {string} command
   * @param {number} expiry
   * @return {*}
   * @memberof CooldownHandler
   */
  setCooldown(user: string, command: string, expiry: number) {
    this.set(`${user}:${command}`, expiry);
    return Promise.resolve(true);
  }
}

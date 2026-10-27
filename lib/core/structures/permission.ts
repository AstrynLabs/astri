import { Permissions } from '../../constants';
import type { PermissionName, PermissionResolvable } from '../../types';

/**
 * A set of allowed and denied permission bits. Outside of overwrites, `deny` is always `0n`. Instances never change:
 * {@link Permission.add} and {@link Permission.remove} return new ones.
 *
 * Every method that takes permissions accepts a name, a raw bitfield, another `Permission` (its `allow` bits), or an
 * array mixing any of these.
 */
export class Permission {
    readonly allow: bigint;
    readonly deny: bigint;

    constructor(allow: bigint | string = 0n, deny: bigint | string = 0n) {
        this.allow = BigInt(allow);
        this.deny = BigInt(deny);
    }

    /** A permission set allowing exactly `permissions`. */
    static from(permissions: PermissionResolvable): Permission {
        return new Permission(Permission.#resolve(permissions));
    }

    /** Whether every one of `permissions` is allowed. */
    has(permissions: PermissionResolvable): boolean {
        const bits = Permission.#resolve(permissions);
        return (this.allow & bits) === bits;
    }

    /** Whether at least one of `permissions` is allowed. */
    any(permissions: PermissionResolvable): boolean {
        return (this.allow & Permission.#resolve(permissions)) !== 0n;
    }

    /** The names of `permissions` that are not allowed. Empty when {@link Permission.has} would be `true`. */
    missing(permissions: PermissionResolvable): PermissionName[] {
        return Permission.#names(Permission.#resolve(permissions) & ~this.allow);
    }

    /** The names of every allowed permission. */
    toArray(): PermissionName[] {
        return Permission.#names(this.allow);
    }

    /** A copy that also allows `permissions`, and no longer denies them. */
    add(permissions: PermissionResolvable): Permission {
        const bits = Permission.#resolve(permissions);
        return new Permission(this.allow | bits, this.deny & ~bits);
    }

    /** A copy that no longer allows `permissions`. Denied bits are kept. */
    remove(permissions: PermissionResolvable): Permission {
        return new Permission(this.allow & ~Permission.#resolve(permissions), this.deny);
    }

    /** Whether `other` allows the same bits. A `Permission` must also deny the same bits. */
    equals(other: PermissionResolvable): boolean {
        if (other instanceof Permission) return this.allow === other.allow && this.deny === other.deny;
        return this.deny === 0n && this.allow === Permission.#resolve(other);
    }

    /** Every allowed permission as `true` and every denied one as `false`. Permissions that are neither are left out. */
    get json(): Partial<Record<PermissionName, boolean>> {
        const json: Partial<Record<PermissionName, boolean>> = {};
        for (const [name, bit] of Object.entries(Permissions) as [PermissionName, bigint][]) {
            if ((this.allow & bit) !== 0n) json[name] = true;
            else if ((this.deny & bit) !== 0n) json[name] = false;
        }
        return json;
    }

    /** The allowed bits as a decimal string, the form REST bodies such as a role's `permissions` take. */
    toString(): string {
        return this.allow.toString();
    }

    /** The bitfields as decimal strings, the form Discord sends and accepts. */
    toJSON(): { allow: string; deny: string } {
        return { allow: this.allow.toString(), deny: this.deny.toString() };
    }

    static #resolve(permissions: PermissionResolvable): bigint {
        if (typeof permissions === 'bigint') return permissions;
        if (permissions instanceof Permission) return permissions.allow;
        if (Array.isArray(permissions)) return permissions.reduce<bigint>((bits, permission) => bits | Permission.#resolve(permission), 0n);
        const bit = Permissions[permissions as PermissionName] as bigint | undefined;
        if (bit === undefined) throw new RangeError(`Unknown permission: ${String(permissions)}`);
        return bit;
    }

    static #names(bits: bigint): PermissionName[] {
        return (Object.entries(Permissions) as [PermissionName, bigint][]).filter(([, bit]) => (bits & bit) !== 0n).map(([name]) => name);
    }
}

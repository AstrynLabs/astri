import type { Permissions } from '../constants';
import type { Permission } from '../core/structures';

/** A key of {@link Permissions}. */
export type PermissionName = keyof typeof Permissions;

/** A permission name, a raw bitfield, a {@link Permission} (its allowed bits), or an array mixing any of these. */
export type PermissionResolvable = PermissionName | bigint | Permission | readonly PermissionResolvable[];

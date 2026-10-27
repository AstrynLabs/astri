import type { RESTBody } from './rest';

/** Changes to the application. Fields left out are kept. */
export type ApplicationEditData = RESTBody<'/applications/@me', 'patch'>;

/** A new application emoji. `image` is a data URI. */
export type ApplicationEmojiCreateData = RESTBody<'/applications/{application_id}/emojis', 'post'>;

/** Changes to an application emoji. Only `name` can change. */
export type ApplicationEmojiEditData = RESTBody<'/applications/{application_id}/emojis/{emoji_id}', 'patch'>;

/** The full list of linked role metadata fields, at most 5. Fields left out are deleted. */
export type RoleConnectionMetadataData = NonNullable<RESTBody<'/applications/{application_id}/role-connections/metadata', 'put'>>;

/** A test entitlement to a SKU for a user or guild, which grants access without a purchase. */
export type TestEntitlementCreateData = RESTBody<'/applications/{application_id}/entitlements', 'post'>;

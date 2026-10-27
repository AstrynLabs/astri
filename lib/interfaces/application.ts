import type { ApplicationRoleConnectionMetadataTypes } from '../constants';
import type { Permission, User } from '../core/structures';

/** One field of the application's linked role metadata, which guilds can require for a role. */
export interface ApplicationRoleConnectionMetadata {
    type: ApplicationRoleConnectionMetadataTypes;
    /** The field's name in each user's role connection. */
    key: string;
    name: string;
    nameLocalizations: Record<string, string> | null;
    description: string;
    descriptionLocalizations: Record<string, string> | null;
}

/** A running instance of the application's activity. */
export interface ActivityInstance {
    applicationId: string;
    instanceId: string;
    /** Unique to this launch of the activity. */
    launchId: string;
    location: ActivityLocation;
    /** Users connected to the instance. */
    userIds: string[];
}

/** Where an activity instance runs. */
export interface ActivityLocation {
    id: string;
    /** `gc` in a guild channel, `pc` in a DM or group DM. */
    kind: 'gc' | 'pc';
    channelId: string;
    /** `null` outside guilds. */
    guildId: string | null;
}

/** The client's own application, as its owner sees it. */
export interface Application {
    id: string;
    name: string;
    /** Icon hash. */
    icon: string | null;
    description: string;
    /** Rich presence invite cover image hash. */
    coverImage: string | null;
    /** Application flag bits, combined. */
    flags: number;
    owner: User;
    /** Set when a team owns the application. */
    team: ApplicationTeam | null;
    /** Whether anyone can add the bot, not just the owner. */
    botPublic: boolean;
    /** Whether adding the bot needs the full OAuth2 code grant. */
    botRequireCodeGrant: boolean;
    /** Hex key for checking interaction request signatures. */
    verifyKey: string;
    /** The guild the application is linked to, for games sold on Discord. */
    guildId: string | null;
    /** The SKU of the game, for games sold on Discord. */
    primarySkuId: string | null;
    termsOfServiceURL: string | null;
    privacyPolicyURL: string | null;
    customInstallURL: string | null;
    /** Up to 5 tags describing the application. */
    tags: string[];
    installParams: ApplicationInstallParams | null;
    /** Default install settings per installation context: `0` guild, `1` user. */
    integrationTypesConfig: Record<string, ApplicationInstallParams | null>;
    redirectURIs: string[];
    /** Where interactions are sent instead of the gateway, or `null`. */
    interactionsEndpointURL: string | null;
    /** Linked roles verification URL, or `null`. */
    roleConnectionsVerificationURL: string | null;
    approximateGuildCount: number;
    approximateUserInstallCount: number;
}

/** A team owning an application. */
export interface ApplicationTeam {
    id: string;
    name: string;
    /** Icon hash. */
    icon: string | null;
    ownerUserId: string;
}

/** The OAuth2 scopes and bot permissions the in-app install link asks for. */
export interface ApplicationInstallParams {
    scopes: string[];
    permissions: Permission;
}

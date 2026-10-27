import type { ApplicationRoleConnectionMetadataTypes } from '../constants';

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

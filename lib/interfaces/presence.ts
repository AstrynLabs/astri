import type { ActivityTypes } from '../constants';
import type { PresenceStatus } from '../types';

export interface ActivityEmoji {
    name: string;
    /** Custom emojis only. */
    id: string | null;
    animated: boolean;
}

export interface ActivityAssets {
    largeImage: string | null;
    largeText: string | null;
    largeURL: string | null;
    smallImage: string | null;
    smallText: string | null;
    smallURL: string | null;
}

/** What a user is doing, as shown on their profile. */
export interface Activity {
    name: string;
    type: ActivityTypes;
    /** Streaming activities only. */
    url: string | null;
    /** Unix ms the activity was added to the session. */
    createdAt: number;
    /** Unix ms the activity started, or `null`. */
    startedAt: number | null;
    /** Unix ms the activity ends, or `null`. */
    endsAt: number | null;
    applicationId: string | null;
    /** Which field is shown in the member list: `0` name, `1` state, `2` details. */
    statusDisplayType: number | null;
    details: string | null;
    detailsURL: string | null;
    state: string | null;
    stateURL: string | null;
    /** Custom statuses only. */
    emoji: ActivityEmoji | null;
    partyId: string | null;
    /** Current and maximum party size, or `null`. */
    partySize: [current: number, max: number] | null;
    assets: ActivityAssets | null;
    instance: boolean;
    flags: number;
    /** Labels of the buttons shown on the activity. */
    buttons: string[];
}

/** The status on each platform the user is signed in on. Platforms they are offline on are `null`. */
export interface ClientStatus {
    desktop: PresenceStatus | null;
    mobile: PresenceStatus | null;
    web: PresenceStatus | null;
}

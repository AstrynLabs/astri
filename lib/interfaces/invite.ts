import type { ChannelTypes } from '../constants';

/** What an invite says about its guild, which may not be cached. */
export interface InviteGuild {
    id: string;
    name: string;
    icon: string | null;
    splash: string | null;
    banner: string | null;
    description: string | null;
    features: string[];
    verificationLevel: number | null;
    vanityURLCode: string | null;
    nsfwLevel: number | null;
    premiumSubscriptionCount: number;
}

/** What an invite says about its channel, which may not be cached. */
export interface InviteChannel {
    id: string;
    type: ChannelTypes;
    name: string | null;
}

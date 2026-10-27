/** The guild a channel follower webhook crossposts from. */
export interface WebhookSourceGuild {
    id: string;
    name: string;
    icon: string | null;
}

/** The announcement channel a channel follower webhook crossposts from. */
export interface WebhookSourceChannel {
    id: string;
    name: string;
}

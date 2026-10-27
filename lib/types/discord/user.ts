export interface APIUser {
    id: string;
    username: string;
    discriminator: string;
    global_name: string | null;
    avatar: string | null;
    bot?: boolean;
    system?: boolean;
    banner?: string | null;
    accent_color?: number | null;
    public_flags?: number;
}

/** The client's own user, as sent in `READY`, `USER_UPDATE` and `GET /users/@me`. */
export interface APICurrentUser extends APIUser {
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: string | null;
    flags?: number;
}

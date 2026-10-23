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

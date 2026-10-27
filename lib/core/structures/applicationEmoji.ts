import type { APIApplicationEmoji, ApplicationEmojiEditData, ClientContext } from '../../types';
import { Base } from './base';
import { upsertUser, type User } from './user';

/** An emoji owned by the application, usable by its bot in any guild. Application emojis are not cached, since no event carries them. */
export class ApplicationEmoji extends Base {
    readonly applicationId: string;
    name: string;
    /** Who uploaded it. */
    user: User | null = null;
    animated = false;

    constructor(client: ClientContext, data: APIApplicationEmoji, applicationId: string) {
        super(client, data.id);
        this.applicationId = applicationId;
        this.patch(data);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIApplicationEmoji>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.user !== undefined) this.user = upsertUser(this.client, data.user);
        if (data.animated !== undefined) this.animated = data.animated;
    }

    async edit(data: ApplicationEmojiEditData): Promise<this> {
        this.patch(await this.client.rest.patch('applicationEmoji', this.applicationId, this.id, data));
        return this;
    }

    async delete(): Promise<void> {
        await this.client.rest.delete('applicationEmoji', this.applicationId, this.id);
    }
}

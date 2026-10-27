import type { ApplicationCommandTypes, InteractionContextTypes } from '../../constants';
import type { ApplicationCommandOption, GuildApplicationCommandPermissions } from '../../interfaces';
import type { APIApplicationCommand, ApplicationCommandEditData, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { toCommandOption, toCommandPermissions } from './util';

/** A command registered by the application, globally or in one guild. Commands are not cached, since no event carries them. */
export class ApplicationCommand extends Base {
    readonly applicationId: string;
    /** `null` for global commands. */
    readonly guildId: string | null;
    readonly type: ApplicationCommandTypes;
    name: string;
    nameLocalizations: Record<string, string> | null = null;
    /** Empty for user and message commands. */
    description = '';
    descriptionLocalizations: Record<string, string> | null = null;
    options: ApplicationCommandOption[] = [];
    /** Permissions members need to see the command, or `null` for everyone. Admins can override it per guild. */
    defaultMemberPermissions: bigint | null = null;
    /** Where the command can be used. `null` means the default for the installation context. */
    contexts: InteractionContextTypes[] | null = null;
    /** Installation contexts the command is available in: `0` guild, `1` user. */
    integrationTypes: number[] = [];
    nsfw = false;
    /** Changes whenever the command is updated. */
    version: string;

    constructor(client: ClientContext, data: APIApplicationCommand) {
        super(client, data.id);
        this.applicationId = data.application_id;
        this.guildId = data.guild_id ?? null;
        this.type = data.type;
        this.patch(data);
    }

    /** The guild the command is registered in, if it is a guild command and the guild is cached. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIApplicationCommand>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.name_localizations !== undefined) this.nameLocalizations = data.name_localizations;
        if (data.description !== undefined) this.description = data.description;
        if (data.description_localizations !== undefined) this.descriptionLocalizations = data.description_localizations;
        if (data.options !== undefined) this.options = data.options.map(toCommandOption);
        if (data.default_member_permissions !== undefined) this.defaultMemberPermissions = data.default_member_permissions === null ? null : BigInt(data.default_member_permissions);
        if (data.contexts !== undefined) this.contexts = data.contexts;
        if (data.integration_types !== undefined) this.integrationTypes = data.integration_types;
        if (data.nsfw !== undefined) this.nsfw = data.nsfw;
        if (data.version !== undefined) this.version = data.version;
    }

    async edit(data: ApplicationCommandEditData): Promise<this> {
        if (this.guildId === null) this.patch(await this.client.rest.patch('applicationCommand', this.applicationId, this.id, data));
        else this.patch(await this.client.rest.patch('applicationGuildCommand', this.applicationId, this.guildId, this.id, data));
        return this;
    }

    async delete(): Promise<void> {
        if (this.guildId === null) await this.client.rest.delete('applicationCommand', this.applicationId, this.id);
        else await this.client.rest.delete('applicationGuildCommand', this.applicationId, this.guildId, this.id);
    }

    /** Who can use the command in a guild, its own guild by default. Throws if the guild has no overrides for it. */
    async fetchPermissions(guildId = this.guildId): Promise<GuildApplicationCommandPermissions> {
        if (guildId === null) throw new Error(`Command ${this.id} is global, so a guild id is needed to fetch its permissions`);
        return toCommandPermissions(await this.client.rest.get('applicationGuildCommandPermissions', this.applicationId, guildId, this.id));
    }
}

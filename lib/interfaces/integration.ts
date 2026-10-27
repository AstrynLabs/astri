import type { User } from '../core/structures';

export interface IntegrationApplication {
    id: string;
    name: string;
    icon: string | null;
    description: string;
    bot: User | null;
}

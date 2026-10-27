import type { DispatchHandler } from '../../../types';

export const rateLimited: DispatchHandler<'RATE_LIMITED'> = (client, data, shard) => {
    const retryAfter = Math.ceil(data.retry_after * 1000);
    const nonce = data.meta.nonce ?? null;
    client.emit('gatewayRateLimit', data.opcode, retryAfter, data.meta.guild_id, nonce, shard);
    if (nonce !== null) client.rejectMemberRequest(nonce, new Error(`Guild members request for guild ${data.meta.guild_id} was rate limited, retry after ${retryAfter}ms`));
};

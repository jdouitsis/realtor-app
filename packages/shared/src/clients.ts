/**
 * Client status values used across server and client.
 */
export const CLIENT_STATUSES = ['invited', 'active', 'inactive'] as const

export type ClientStatus = (typeof CLIENT_STATUSES)[number]

/**
 * Default statuses shown in the clients list filter.
 */
export const DEFAULT_CLIENT_STATUSES: ClientStatus[] = ['invited', 'active']

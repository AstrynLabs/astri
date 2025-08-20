import type { CooldownType } from '../commands/CooldownHandler';

export enum CommandError {
  NotDeveloperGuild,
  DeniedUser,
  DeniedGuild,
  MissingPermission,
  OnCooldown,
  MiddlewareError,
  UncaughtError
}

export type CommandErrorData = CommandSnowflakeError | CommandCooldownError | CommandPermissionError | CommandMiddlewareError | CommandUncaughtError;

export interface CommandSnowflakeError {
  type: CommandError.DeniedUser | CommandError.DeniedGuild | CommandError.NotDeveloperGuild | CommandError.NotDeveloperGuild;
  data: string | undefined;
}

export interface CommandCooldownError {
  type: CommandError.OnCooldown;
  data: { userID: string; cooldown: CooldownType };
}

export interface CommandPermissionError {
  type: CommandError.MissingPermission;
  data: { userID: string; permissions: string[] };
}

export interface CommandMiddlewareError {
  type: CommandError.MiddlewareError;
  data: unknown;
}

export interface CommandUncaughtError {
  type: CommandError.UncaughtError;
  interaction: 'command' | 'component' | 'autocomplete' | 'modal';
  data: Error;
}

import pkg from '../package.json';

export const VERSION = pkg.version;

export * from './constants';
export * from './core/client';
export * from './core/cache';
export * from './core/structures';
export * from './core/ws';
export * from './types';

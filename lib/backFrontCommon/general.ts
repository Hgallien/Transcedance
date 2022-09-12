export type Id = number;
export type TypeMap<T> = { [Key in keyof T]: { key: Key, payload: T[Key] } }[keyof T];
import { Socket as ClientSocketBaseType } from 'socket.io-client';
import { Socket as ServerSocketBaseType, Server as ServerBaseType } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from './chatEvents';

export type ClientSocket = ClientSocketBaseType<ServerToClientEvents, ClientToServerEvents>;
export type ServerSocket = ServerSocketBaseType<ClientToServerEvents, ServerToClientEvents>;
export type Server = ServerBaseType<ClientToServerEvents, ServerToClientEvents>;

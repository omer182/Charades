import { createContext, useContext } from 'react';
import type { ScreenRoom } from './screenRoom';

export interface RoomControls {
  room: ScreenRoom;
  openRoom: () => void;
  closeRoom: () => void;
}

const noop = () => undefined;

export const RoomContext = createContext<RoomControls>({
  room: { open: false, status: 'offline', code: null, state: null, remotes: 0 },
  openRoom: noop,
  closeRoom: noop,
});

/** The big screen's phone-control room, for the lobby, header and stage. */
export const useRoom = () => useContext(RoomContext);

/** A phone is running turns, so the screen hides its own buttons. */
export const usePhoneInControl = () => {
  const { room } = useRoom();
  return room.open && room.status === 'live' && room.remotes > 0;
};

export const joinUrl = (code: string) => `${location.origin}/r/${code}`;

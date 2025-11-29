export interface Peer {
  socketId: string;
  connectedAt: Date;
}

export interface SignalPayload {
  to: string;
  from: string;
  data: any;
}
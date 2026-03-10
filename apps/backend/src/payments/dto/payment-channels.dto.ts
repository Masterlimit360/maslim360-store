export interface PaymentChannel {
  id: string;
  name: string;
  displayName: string;
  isAvailable: boolean;
  icon?: string;
}

export interface PaymentChannelsResponse {
  channels: PaymentChannel[];
  message?: string;
}

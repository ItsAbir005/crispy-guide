export interface OrderCreatedEvent {
  orderId: string;
  userEmail: string;
  price: number;
}
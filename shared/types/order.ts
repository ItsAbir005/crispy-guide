export type OrderStatus = "PENDING" | "COMPLETED" | "FAILED";
export interface Order {
  id: string;
  amount: number;
  status: OrderStatus;
}
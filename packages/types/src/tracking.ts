export interface TrackingPoint { latitude: number; longitude: number }
export interface DeliveryPosition extends TrackingPoint { accuracy: number; heading?: number; recordedAt: string }
export interface OrderTracking {
  orderId: number; deliveryId: number | null; status: string | null; active: boolean; leg: 'PICKUP' | 'DROPOFF';
  pickup: TrackingPoint | null; dropoff: TrackingPoint | null;
  rider: (DeliveryPosition & { receivedAt: string }) | null; stale: boolean; polledAt: string;
  map: { image: string | null; routeAvailable: boolean; distanceMeters: number | null; durationSeconds: number | null; message: string | null };
  navigationUrl: string | null;
}

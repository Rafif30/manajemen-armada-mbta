/** Query key terpusat (PRD 6.5). */
export interface VehiclesKeyParams {
  page: number
  limit: number
  routes: string[]
  trips: string[]
}

export const queryKeys = {
  vehicles: (params: VehiclesKeyParams) => ['vehicles', params] as const,
  vehicle: (id: string) => ['vehicle', id] as const,
  routes: ['routes', 'options'] as const,
  trips: (routes: string[]) => ['trips', 'options', { routes }] as const,
}

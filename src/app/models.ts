export type AssetStatus = 'AVAILABLE' | 'IN_OPERATION' | 'IN_MAINTENANCE';
export interface Asset { id: string; name: string; type: string; usage: number; status: AssetStatus; }
export interface Maintenance { id: string; asset: string; type: 'Preventivo' | 'Correctivo'; date: string; status: 'Programado'; }
export interface Operation { id: string; route: string; asset: string; driver: string; status: 'En ruta' | 'Programado'; }
export interface PlatformState { assets: Asset[]; maintenance: Maintenance[]; operations: Operation[]; }

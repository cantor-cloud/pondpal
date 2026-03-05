export type SensorStatus = "normal" | "warning" | "critical";

export interface SensorReading {
  ph: number;
  temperature: number;
  dissolvedOxygen: number;
  turbidity: number;
  humidity: number;
}

export interface Device {
  id: string;
  name: string;
  type: "aquarium" | "pond";
  location: string;
  isOnline: boolean;
  deviceOn: boolean;
  lastUpdated: string;
  readings: SensorReading;
  imageUrl?: string;
  thresholds?: Threshold[];
}

export interface Notification {
  id: string;
  deviceId: string;
  deviceName: string;
  type: "warning" | "critical" | "info";
  sensor: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface HistoryEntry {
  id: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  readings: SensorReading;
  deviceOn: boolean;
}

export interface Threshold {
  sensor: string;
  label: string;
  unit: string;
  min: number;
  max: number;
}

export const devices: Device[] = [
  {
    id: "d1",
    name: "Main Koi Pond",
    type: "pond",
    location: "Backyard",
    isOnline: true,
    deviceOn: true,
    lastUpdated: "2 min ago",
    readings: {
      ph: 7.2,
      temperature: 26.5,
      dissolvedOxygen: 7.8,
      turbidity: 12.3,
      humidity: 68,
    },
  },
  {
    id: "d2",
    name: "Tropical Aquarium",
    type: "aquarium",
    location: "Living Room",
    isOnline: true,
    deviceOn: true,
    lastUpdated: "5 min ago",
    readings: {
      ph: 4.2,
      temperature: 35.8,
      dissolvedOxygen: 3.5,
      turbidity: 28.7,
      humidity: 95,
    },
  },
  {
    id: "d3",
    name: "Tilapia Pond",
    type: "pond",
    location: "Farm Area",
    isOnline: true,
    deviceOn: true,
    lastUpdated: "1 min ago",
    readings: {
      ph: 8.1,
      temperature: 29.4,
      dissolvedOxygen: 5.1,
      turbidity: 24.5,
      humidity: 80,
    },
  },
  {
    id: "d4",
    name: "Reef Tank",
    type: "aquarium",
    location: "Study Room",
    isOnline: false,
    deviceOn: false,
    lastUpdated: "2 hrs ago",
    readings: {
      ph: 8.3,
      temperature: 25.0,
      dissolvedOxygen: 8.1,
      turbidity: 5.2,
      humidity: 72,
    },
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    deviceId: "d2",
    deviceName: "Tropical Aquarium",
    type: "critical",
    sensor: "pH",
    message: "CRITICAL: pH level dangerously low at 4.2. Immediate action required!",
    timestamp: "2026-03-05T10:22:00",
    read: false,
  },
  {
    id: "n2",
    deviceId: "d2",
    deviceName: "Tropical Aquarium",
    type: "critical",
    sensor: "Temperature",
    message: "CRITICAL: Temperature extremely high at 35.8°C. Check heating system!",
    timestamp: "2026-03-05T10:20:00",
    read: false,
  },
  {
    id: "n3",
    deviceId: "d2",
    deviceName: "Tropical Aquarium",
    type: "critical",
    sensor: "Dissolved Oxygen",
    message: "CRITICAL: Dissolved oxygen dangerously low at 3.5 mg/L. Fish at risk!",
    timestamp: "2026-03-05T10:18:00",
    read: false,
  },
  {
    id: "n4",
    deviceId: "d3",
    deviceName: "Tilapia Pond",
    type: "warning",
    sensor: "Turbidity",
    message: "Turbidity above threshold: 24.5 NTU. Check water quality.",
    timestamp: "2026-03-05T09:45:00",
    read: false,
  },
  {
    id: "n5",
    deviceId: "d4",
    deviceName: "Reef Tank",
    type: "critical",
    sensor: "Device",
    message: "Device offline. Last seen 2 hours ago.",
    timestamp: "2026-03-04T20:00:00",
    read: true,
  },
  {
    id: "n6",
    deviceId: "d1",
    deviceName: "Main Koi Pond",
    type: "info",
    sensor: "Temperature",
    message: "Temperature normalized at 26.5°C.",
    timestamp: "2026-03-04T18:30:00",
    read: true,
  },
];

export const historyData: HistoryEntry[] = [
  {
    id: "h1",
    deviceId: "d1",
    deviceName: "Main Koi Pond",
    timestamp: "2026-03-03T10:00:00",
    readings: { ph: 7.2, temperature: 26.5, dissolvedOxygen: 7.8, turbidity: 12.3, humidity: 68 },
    deviceOn: true,
  },
  {
    id: "h2",
    deviceId: "d1",
    deviceName: "Main Koi Pond",
    timestamp: "2026-03-03T08:00:00",
    readings: { ph: 7.0, temperature: 26.8, dissolvedOxygen: 7.2, turbidity: 13.1, humidity: 70 },
    deviceOn: true,
  },
  {
    id: "h3",
    deviceId: "d3",
    deviceName: "Tilapia Pond",
    timestamp: "2026-03-03T10:00:00",
    readings: { ph: 8.1, temperature: 29.4, dissolvedOxygen: 5.1, turbidity: 24.5, humidity: 80 },
    deviceOn: true,
  },
  {
    id: "h4",
    deviceId: "d2",
    deviceName: "Tropical Aquarium",
    timestamp: "2026-03-03T09:30:00",
    readings: { ph: 4.2, temperature: 35.8, dissolvedOxygen: 3.5, turbidity: 28.7, humidity: 95 },
    deviceOn: true,
  },
  {
    id: "h5",
    deviceId: "d1",
    deviceName: "Main Koi Pond",
    timestamp: "2026-03-03T06:00:00",
    readings: { ph: 6.9, temperature: 25.2, dissolvedOxygen: 6.8, turbidity: 14.0, humidity: 66 },
    deviceOn: true,
  },
  {
    id: "h6",
    deviceId: "d3",
    deviceName: "Tilapia Pond",
    timestamp: "2026-03-03T08:00:00",
    readings: { ph: 7.9, temperature: 28.8, dissolvedOxygen: 5.8, turbidity: 22.0, humidity: 78 },
    deviceOn: true,
  },
  {
    id: "h7",
    deviceId: "d4",
    deviceName: "Reef Tank",
    timestamp: "2026-03-02T18:00:00",
    readings: { ph: 8.3, temperature: 25.0, dissolvedOxygen: 8.1, turbidity: 5.2, humidity: 72 },
    deviceOn: false,
  },
  {
    id: "h8",
    deviceId: "d2",
    deviceName: "Tropical Aquarium",
    timestamp: "2026-03-03T07:00:00",
    readings: { ph: 4.5, temperature: 34.2, dissolvedOxygen: 3.8, turbidity: 27.5, humidity: 92 },
    deviceOn: true,
  },
];

export const defaultThresholds: Threshold[] = [
  { sensor: "ph", label: "pH Level", unit: "", min: 6.5, max: 8.5 },
  { sensor: "temperature", label: "Temperature", unit: "°C", min: 20, max: 32 },
  { sensor: "dissolvedOxygen", label: "Dissolved Oxygen", unit: "mg/L", min: 5.0, max: 12.0 },
  { sensor: "turbidity", label: "Turbidity", unit: "NTU", min: 0, max: 20 },
  { sensor: "humidity", label: "Humidity", unit: "%", min: 40, max: 90 },
];

export function getSensorStatus(sensor: keyof SensorReading, value: number, thresholds: Threshold[]): SensorStatus {
  const threshold = thresholds.find((t) => t.sensor === sensor);
  if (!threshold) return "normal";
  
  const range = threshold.max - threshold.min;
  const criticalMargin = range * 0.1;

  if (value < threshold.min - criticalMargin || value > threshold.max + criticalMargin) return "critical";
  if (value < threshold.min || value > threshold.max) return "warning";
  return "normal";
}

export function getDeviceThresholds(device: Device, globalThresholds: Threshold[]): Threshold[] {
  return device.thresholds || globalThresholds;
}

export type TrendDirection = "up" | "down" | "stable";

export interface SensorHistory {
  timestamp: string;
  [key: string]: number | string;
}

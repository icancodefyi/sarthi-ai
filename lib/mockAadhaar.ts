export interface FarmerProfile {
  aadhaar: string; // 12-digit string
  name: string;
  age: number;
  village: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  crops: string[];
  landAcres: number;
  soilType: string;
  irrigationType: string;
  annualIncomeINR: number;
  phone: string;
}

export const MOCK_FARMERS: FarmerProfile[] = [
  {
    aadhaar: "123456789012",
    name: "Ravi Kumar Shinde",
    age: 42,
    village: "Sinnar",
    district: "Nashik",
    state: "Maharashtra",
    lat: 19.85,
    lon: 73.98,
    crops: ["Grapes", "Onion"],
    landAcres: 3.5,
    soilType: "Black Cotton Soil",
    irrigationType: "Drip Irrigation",
    annualIncomeINR: 280000,
    phone: "9821XXXXXX",
  },
  {
    aadhaar: "234567890123",
    name: "Suresh Mangalbhai Patel",
    age: 55,
    village: "Olpad",
    district: "Surat",
    state: "Gujarat",
    lat: 21.34,
    lon: 72.75,
    crops: ["Cotton", "Groundnut"],
    landAcres: 7.0,
    soilType: "Sandy Loam",
    irrigationType: "Canal Irrigation",
    annualIncomeINR: 420000,
    phone: "9724XXXXXX",
  },
  {
    aadhaar: "345678901234",
    name: "Lakshmi Venkata Devi",
    age: 38,
    village: "Tenali",
    district: "Guntur",
    state: "Andhra Pradesh",
    lat: 16.24,
    lon: 80.64,
    crops: ["Rice", "Chilli"],
    landAcres: 5.0,
    soilType: "Alluvial Soil",
    irrigationType: "Canal + Borewell",
    annualIncomeINR: 350000,
    phone: "9848XXXXXX",
  },
  {
    aadhaar: "456789012345",
    name: "Gurpreet Singh Dhillon",
    age: 48,
    village: "Tarn Taran",
    district: "Amritsar",
    state: "Punjab",
    lat: 31.45,
    lon: 74.93,
    crops: ["Wheat", "Paddy"],
    landAcres: 12.0,
    soilType: "Sandy Clay Loam",
    irrigationType: "Tubewell",
    annualIncomeINR: 680000,
    phone: "9815XXXXXX",
  },
  {
    aadhaar: "567890123456",
    name: "Mohammed Yusuf Biradar",
    age: 44,
    village: "Humnabad",
    district: "Bidar",
    state: "Karnataka",
    lat: 17.76,
    lon: 76.94,
    crops: ["Sugarcane", "Tur Dal"],
    landAcres: 6.0,
    soilType: "Red Laterite",
    irrigationType: "Drip + Borewell",
    annualIncomeINR: 310000,
    phone: "9916XXXXXX",
  },
];

export function getFarmerByAadhaar(aadhaar: string): FarmerProfile | null {
  const clean = aadhaar.replace(/\D/g, "");
  return MOCK_FARMERS.find((f) => f.aadhaar === clean) ?? null;
}

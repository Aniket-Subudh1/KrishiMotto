export type IndiaStateDistricts = {
  state: string;
  districts: string[];
};

export type IndiaLocationDirectory = {
  states: IndiaStateDistricts[];
};

export type PincodePostOffice = {
  Name: string;
  District: string;
  State: string;
  Pincode: string;
  Country: string;
};

export type PincodeLookupResponse = {
  Status: string;
  Message: string;
  PostOffice: PincodePostOffice[] | null;
};

export type PincodeLookupResult = {
  pincode: string;
  state: string;
  district: string;
  rawState: string;
  rawDistrict: string;
};

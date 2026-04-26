import axios from 'axios';

export interface PincodeResult {
  city: string;
  state: string;
  district: string;
}

export async function lookupPincode(pincode: string): Promise<PincodeResult | null> {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return null;

  try {
    const res = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = res.data?.[0];
    if (data?.Status !== 'Success' || !data.PostOffice?.length) return null;

    const po = data.PostOffice[0];
    return {
      city: po.Block !== 'NA' ? po.Block : po.District,
      state: po.State,
      district: po.District,
    };
  } catch {
    return null;
  }
}

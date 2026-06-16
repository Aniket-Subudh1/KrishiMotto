/** Mirrors backend transport addend (₹500). */
export const TRANSPORT_FEE_PAISE = 50_000;

/** Mirrors backend PerAcreStrategy — billing units are ceil(acres), min 1. */
export function computePerAcrePricing(
  areaAcres: number,
  basePricePaise: number,
  transportApplies = false,
) {
  const areaUnits = Math.max(1, Math.ceil(areaAcres));
  const basePaise = basePricePaise * areaUnits;
  const transportPaise = transportApplies ? TRANSPORT_FEE_PAISE : 0;
  return { areaUnits, basePaise, transportPaise, totalPaise: basePaise + transportPaise };
}

/** Mirrors backend FlatStrategy. */
export function computeFlatPricing(basePricePaise: number, transportApplies = false) {
  const transportPaise = transportApplies ? TRANSPORT_FEE_PAISE : 0;
  return {
    areaUnits: 1,
    basePaise: basePricePaise,
    transportPaise,
    totalPaise: basePricePaise + transportPaise,
  };
}

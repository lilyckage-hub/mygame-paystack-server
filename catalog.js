// Server-side source of truth for prices. The client sends a pack_id /
// item_id only — never an amount — so a tampered client can't ask for more
// gems than it paid for, or buy an item for less than its real price.
//
// `ghsKobo` is the amount in the smallest unit of GHS (pesewas) that
// Paystack's API expects. Adjust currency/amounts to your market.

export const PACKS = {
  gems_500: { gems: 500, fiatDisplay: 4.99, currency: "GHS", ghsKobo: 2960 },
  gems_1200: { gems: 1200, fiatDisplay: 9.99, currency: "GHS", ghsKobo: 5920 },
  gems_2600: { gems: 2600, fiatDisplay: 19.99, currency: "GHS", ghsKobo: 11840 },
  gems_7000: { gems: 7000, fiatDisplay: 49.99, currency: "GHS", ghsKobo: 29600 },
  season_pass: { gems: 3000, fiatDisplay: 9.99, currency: "GHS", ghsKobo: 5920 },
};

export const SHOP_ITEMS = {
  c1: { name: "Blitz — Star Quarterback", game: "GRIDIRON LEGENDS", price: 850 },
  c2: { name: "'Iron Fang' Champion Skin", game: "IRON FANG BOXING", price: 1200 },
  c3: { name: "Kestrel — Legendary Racer", game: "VOLT DRIFT", price: 950 },
  c4: { name: "Void Reaper Character Pack", game: "CINDER PROTOCOL", price: 1500 },
};

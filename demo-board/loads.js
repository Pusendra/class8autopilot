// Board data. Pickup windows are hours from "now" so the demo always has live loads.
window.LOADLINE_LOADS = [
  { id: 'LL-48213', age: 4,  pu: [2, 5],    eq: 'V', o: 'Dallas, TX',       d: 'Memphis, TN',       mi: 452,  len: 48, wt: 38000, co: 'Bluff City Brokerage',  ph: '(901) 555-0142', em: 'loads@bluffcity.example',  rate: 1420 },
  { id: 'LL-48207', age: 9,  pu: [1.5, 3],  eq: 'V', o: 'Fort Worth, TX',   d: 'Atlanta, GA',       mi: 812,  len: 53, wt: 42500, co: 'Peachtree Logistics',   ph: '(404) 555-0187', em: 'dispatch@peachtree.example', rate: 2150 },
  { id: 'LL-48199', age: 12, pu: [3, 4],    eq: 'V', o: 'Houston, TX',      d: 'Chicago, IL',       mi: 1085, len: 53, wt: 40000, co: 'Great Lakes Freight',   ph: '(312) 555-0110', em: 'ops@greatlakesfrt.example', rate: null },
  { id: 'LL-48188', age: 15, pu: [20, 23],  eq: 'V', o: 'Denton, TX',       d: 'Oklahoma City, OK', mi: 190,  len: 48, wt: 22000, co: 'Red Dirt Transport',    ph: '(405) 555-0133', em: 'book@reddirt.example',     rate: 520 },
  { id: 'LL-48181', age: 18, pu: [5, 8],    eq: 'V', o: 'Waco, TX',         d: 'Denver, CO',        mi: 894,  len: 53, wt: 36800, co: 'Front Range Freight',   ph: '(303) 555-0161', em: 'loads@frontrange.example', rate: 2480 },
  { id: 'LL-48176', age: 21, pu: [4, 7],    eq: 'R', o: 'Dallas, TX',       d: 'Phoenix, AZ',       mi: 1065, len: 53, wt: 41000, co: 'Saguaro Cold Chain',    ph: '(602) 555-0119', em: 'reefer@saguaro.example',   rate: 3050 },
  { id: 'LL-48170', age: 23, pu: [6, 9],    eq: 'F', o: 'Houston, TX',      d: 'New Orleans, LA',   mi: 348,  len: 48, wt: 46000, co: 'Bayou Steel Haulers',   ph: '(504) 555-0175', em: 'flat@bayousteel.example',  rate: 1150 },
  { id: 'LL-48162', age: 27, pu: [3, 6],    eq: 'V', o: 'Tyler, TX',        d: 'Little Rock, AR',   mi: 250,  len: 48, wt: 30000, co: 'Natural State Freight', ph: '(501) 555-0122', em: 'loads@naturalstate.example', rate: 780 },
  { id: 'LL-48155', age: 31, pu: [6, 9],    eq: 'V', o: 'Dallas, TX',       d: 'Kansas City, MO',   mi: 505,  len: 53, wt: 39000, co: 'Heartland Load Co',     ph: '(816) 555-0104', em: 'desk@heartlandload.example', rate: 1390 },
  { id: 'LL-48149', age: 34, pu: [7, 10],   eq: 'V', o: 'Austin, TX',       d: 'Nashville, TN',     mi: 860,  len: 53, wt: 35500, co: 'Music City Logistics',  ph: '(615) 555-0158', em: 'loads@musiccity.example',  rate: 2280 },
  { id: 'LL-48141', age: 38, pu: [9, 12],   eq: 'V', o: 'San Antonio, TX',  d: 'St. Louis, MO',     mi: 890,  len: 53, wt: 41200, co: 'Gateway Brokerage',     ph: '(314) 555-0136', em: 'book@gatewaybrk.example',  rate: 2050 },
  { id: 'LL-48133', age: 42, pu: [4, 6],    eq: 'V', o: 'Laredo, TX',       d: 'Chicago, IL',       mi: 1330, len: 53, wt: 43000, co: 'Border Express Brokers', ph: '(956) 555-0147', em: 'loads@borderexp.example', rate: 3600 },
  { id: 'LL-48127', age: 45, pu: [8, 12],   eq: 'V', o: 'Lubbock, TX',      d: 'Albuquerque, NM',   mi: 325,  len: 48, wt: 27000, co: 'Caprock Freight',       ph: '(806) 555-0191', em: 'ops@caprock.example',      rate: 890 },
  { id: 'LL-48120', age: 48, pu: [1, 2.5],  eq: 'V', o: 'Dallas, TX',       d: 'Shreveport, LA',    mi: 190,  len: 48, wt: 18500, co: 'Pelican State Freight', ph: '(318) 555-0116', em: 'loads@pelicanstate.example', rate: 450 },
  { id: 'LL-48114', age: 52, pu: [3, 5],    eq: 'V', o: 'Fort Worth, TX',   d: 'Tulsa, OK',         mi: 300,  len: 53, wt: 33000, co: 'Osage Freight',         ph: '(918) 555-0129', em: 'book@osagefrt.example',    rate: 980 },
  { id: 'LL-48108', age: 55, pu: [20, 26],  eq: 'V', o: 'Dallas, TX',       d: 'Birmingham, AL',    mi: 640,  len: 53, wt: 37000, co: 'Magic City Brokerage',  ph: '(205) 555-0140', em: 'loads@magiccity.example',  rate: 1720 },
  { id: 'LL-48102', age: 58, pu: [22, 34],  eq: 'V', o: 'Olive Branch, MS', d: 'Dallas, TX',        mi: 460,  len: 53, wt: 36000, co: 'Delta Backhaul Co',     ph: '(662) 555-0102', em: 'backhaul@delta.example',   rate: 1480 },
  { id: 'LL-48096', age: 61, pu: [24, 34],  eq: 'V', o: 'Marietta, GA',     d: 'Dallas, TX',        mi: 800,  len: 53, wt: 38500, co: 'Peachtree Logistics',   ph: '(404) 555-0187', em: 'dispatch@peachtree.example', rate: 1900 },
  { id: 'LL-48090', age: 64, pu: [26, 38],  eq: 'V', o: 'Aurora, CO',       d: 'Dallas, TX',        mi: 800,  len: 53, wt: 34000, co: 'Front Range Freight',   ph: '(303) 555-0161', em: 'loads@frontrange.example', rate: 1650 },
  { id: 'LL-48083', age: 67, pu: [28, 32],  eq: 'V', o: 'Norman, OK',       d: 'Dallas, TX',        mi: 200,  len: 48, wt: 21000, co: 'Red Dirt Transport',    ph: '(405) 555-0133', em: 'book@reddirt.example',     rate: 640 },
  { id: 'LL-48077', age: 70, pu: [22, 26],  eq: 'V', o: 'West Memphis, AR', d: 'Nashville, TN',     mi: 215,  len: 48, wt: 24000, co: 'Natural State Freight', ph: '(501) 555-0122', em: 'loads@naturalstate.example', rate: 690 },
  { id: 'LL-48071', age: 74, pu: [30, 40],  eq: 'V', o: 'Joliet, IL',       d: 'Dallas, TX',        mi: 930,  len: 53, wt: 40000, co: 'Great Lakes Freight',   ph: '(312) 555-0110', em: 'ops@greatlakesfrt.example', rate: null },
  { id: 'LL-48065', age: 78, pu: [22, 28],  eq: 'V', o: 'Kansas City, MO',  d: 'Dallas, TX',        mi: 505,  len: 53, wt: 36500, co: 'Heartland Load Co',     ph: '(816) 555-0104', em: 'desk@heartlandload.example', rate: 1300 },
  { id: 'LL-48059', age: 83, pu: [2, 4],    eq: 'F', o: 'Fort Worth, TX',   d: 'San Antonio, TX',   mi: 270,  len: 48, wt: 44000, co: 'Lone Oak Flatbed',      ph: '(817) 555-0173', em: 'flat@loneoak.example',     rate: 890 },
];

// "Refresh results" brings in a couple of fresh posts.
window.LOADLINE_FRESH = [
  { id: 'LL-48230', age: 0, pu: [2, 6], eq: 'V', o: 'Dallas, TX',      d: 'Nashville, TN', mi: 665, len: 53, wt: 39500, co: 'Music City Logistics', ph: '(615) 555-0158', em: 'loads@musiccity.example', rate: 1990 },
  { id: 'LL-48228', age: 1, pu: [3, 5], eq: 'V', o: 'Fort Worth, TX',  d: 'Houston, TX',   mi: 265, len: 48, wt: 26000, co: 'Bayou City Brokers',   ph: '(713) 555-0184', em: 'loads@bayoucity.example', rate: 760 },
];

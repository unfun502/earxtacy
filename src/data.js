import { seededRand, pickWeighted } from "./helpers";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

export const C = {
  bg: "#0A0A0A",
  card: "#111111",
  cardBorder: "#222222",
  pink: "#FF2D55",
  green: "#00FF88",
  yellow: "#FFD600",
  orange: "#FF8800",
  cyan: "#00BFFF",
  purple: "#C084FC",
  text: "#E0E0E0",
  muted: "#666666",
  dim: "#444444",
  white: "#FFFFFF",
};

export const STORES = [
  { key: "bardstown", name: "Bardstown Rd", tag: "FLAGSHIP", base: 145000 },
  { key: "middletown", name: "Middletown", tag: "SUBURBAN", base: 42000 },
  { key: "newalbany", name: "New Albany", tag: "ACROSS THE RIVER", base: 38000 },
  { key: "dixie", name: "Dixie Hwy", tag: "SOUTHWEST", base: 35000 },
];

export const STORE_COLORS = {
  bardstown: C.pink,
  middletown: C.yellow,
  newalbany: C.green,
  dixie: C.cyan,
};

export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const GENRE_COLORS = {
  "Alternative": C.pink,
  "Hip-Hop": C.green,
  "Electronic": C.cyan,
  "Metal/Punk": C.orange,
  "Classic Rock": C.yellow,
  "Country": "#8B6914",
  "R&B/Soul": C.purple,
  "Jazz/Blues": "#6B8A7A",
};

export const GENRES = Object.keys(GENRE_COLORS);

export const MERCH_TYPES = ["T-Shirt", "Poster", "Sticker", "Patch", "Pin", "Tote Bag", "Hat", "Bumper Sticker"];

export const FORMAT_SPLIT = {
  "Compact Disc": { pct: 0.72, color: C.pink },
  "Cassette": { pct: 0.08, color: C.orange },
  "Vinyl": { pct: 0.06, color: C.yellow },
  "Concert Tickets": { pct: 0.06, color: C.green },
  "Merch & Posters": { pct: 0.05, color: C.cyan },
  "Used / Trade-Ins": { pct: 0.03, color: C.purple },
};

export const GENRE_DATA = [
  { genre: "Alt / Indie", value: 92 },
  { genre: "Hip-Hop", value: 78 },
  { genre: "Electronic", value: 65 },
  { genre: "Metal / Punk", value: 71 },
  { genre: "Classic Rock", value: 58 },
  { genre: "Country", value: 42 },
];

/* ═══════════════════════════════════════════
   MONTHLY REVENUE DATA
   ═══════════════════════════════════════════ */

function generateMonthlyData() {
  const rand = seededRand(42);
  const data = [];
  const years = [1998, 1999, 2000];
  const seasonality = [0.85, 0.78, 0.88, 0.92, 0.95, 0.88, 0.82, 0.80, 0.90, 0.95, 1.10, 1.35];
  const yearGrowth = [1.0, 1.12, 1.08];

  years.forEach((year, yi) => {
    MONTHS_SHORT.forEach((month, mi) => {
      const row = { month: `${month} '${String(year).slice(2)}`, year, monthIdx: mi, monthName: month };
      let total = 0;
      STORES.forEach((store) => {
        const jitter = 0.9 + rand() * 0.2;
        const storeSpecific =
          store.key === "middletown" ? (yi === 2 ? 1.15 : 1.0) :
          store.key === "newalbany" ? (yi === 1 ? 1.1 : 0.95) :
          store.key === "dixie" ? (mi >= 9 ? 1.08 : 0.97) : 1.0;
        const val = Math.round(store.base * seasonality[mi] * yearGrowth[yi] * jitter * storeSpecific);
        row[store.key] = val;
        total += val;
      });
      row.total = total;
      data.push(row);
    });
  });
  return data;
}

export const monthlyData = generateMonthlyData();

/* ═══════════════════════════════════════════
   SEED ALBUM DATABASE
   80-100 era-appropriate albums (1996-2000)
   ═══════════════════════════════════════════ */

const SEED_ALBUMS = [
  // Alternative / Indie (25)
  { title: "OK Computer", artist: "Radiohead", genre: "Alternative", year: 1997, tier: 1 },
  { title: "Kid A", artist: "Radiohead", genre: "Alternative", year: 2000, tier: 1 },
  { title: "The Bends", artist: "Radiohead", genre: "Alternative", year: 1995, tier: 2 },
  { title: "Californication", artist: "Red Hot Chili Peppers", genre: "Alternative", year: 1999, tier: 1 },
  { title: "Enema of the State", artist: "blink-182", genre: "Alternative", year: 1999, tier: 1 },
  { title: "Nimrod", artist: "Green Day", genre: "Alternative", year: 1997, tier: 2 },
  { title: "Dookie", artist: "Green Day", genre: "Alternative", year: 1994, tier: 2 },
  { title: "Odelay", artist: "Beck", genre: "Alternative", year: 1996, tier: 2 },
  { title: "Mutations", artist: "Beck", genre: "Alternative", year: 1998, tier: 3 },
  { title: "Either/Or", artist: "Elliott Smith", genre: "Alternative", year: 1997, tier: 3 },
  { title: "XO", artist: "Elliott Smith", genre: "Alternative", year: 1998, tier: 3 },
  { title: "In the Aeroplane Over the Sea", artist: "Neutral Milk Hotel", genre: "Alternative", year: 1998, tier: 3 },
  { title: "The Lonesome Crowded West", artist: "Modest Mouse", genre: "Alternative", year: 1997, tier: 3 },
  { title: "Yield", artist: "Pearl Jam", genre: "Alternative", year: 1998, tier: 2 },
  { title: "No Code", artist: "Pearl Jam", genre: "Alternative", year: 1996, tier: 2 },
  { title: "Adore", artist: "The Smashing Pumpkins", genre: "Alternative", year: 1998, tier: 2 },
  { title: "Mellon Collie and the Infinite Sadness", artist: "The Smashing Pumpkins", genre: "Alternative", year: 1995, tier: 1 },
  { title: "Dizzy Up the Girl", artist: "Goo Goo Dolls", genre: "Alternative", year: 1998, tier: 2 },
  { title: "Parachutes", artist: "Coldplay", genre: "Alternative", year: 2000, tier: 2 },
  { title: "Blur", artist: "Blur", genre: "Alternative", year: 1997, tier: 3 },
  { title: "The Colour and the Shape", artist: "Foo Fighters", genre: "Alternative", year: 1997, tier: 1 },
  { title: "There Is Nothing Left to Lose", artist: "Foo Fighters", genre: "Alternative", year: 1999, tier: 2 },
  { title: "Americana", artist: "The Offspring", genre: "Alternative", year: 1998, tier: 2 },
  { title: "Morning View", artist: "Incubus", genre: "Alternative", year: 1999, tier: 2 },
  { title: "Fashion Nugget", artist: "Cake", genre: "Alternative", year: 1996, tier: 3 },

  // Hip-Hop (15)
  { title: "Stankonia", artist: "OutKast", genre: "Hip-Hop", year: 2000, tier: 1 },
  { title: "Aquemini", artist: "OutKast", genre: "Hip-Hop", year: 1998, tier: 1 },
  { title: "ATLiens", artist: "OutKast", genre: "Hip-Hop", year: 1996, tier: 2 },
  { title: "The Marshall Mathers LP", artist: "Eminem", genre: "Hip-Hop", year: 2000, tier: 1 },
  { title: "The Slim Shady LP", artist: "Eminem", genre: "Hip-Hop", year: 1999, tier: 1 },
  { title: "Significant Other", artist: "Limp Bizkit", genre: "Hip-Hop", year: 1999, tier: 1 },
  { title: "The Miseducation of Lauryn Hill", artist: "Lauryn Hill", genre: "Hip-Hop", year: 1998, tier: 1 },
  { title: "Things Fall Apart", artist: "The Roots", genre: "Hip-Hop", year: 1999, tier: 2 },
  { title: "Illadelph Halflife", artist: "The Roots", genre: "Hip-Hop", year: 1996, tier: 3 },
  { title: "Black on Both Sides", artist: "Mos Def", genre: "Hip-Hop", year: 1999, tier: 2 },
  { title: "Reasonable Doubt", artist: "Jay-Z", genre: "Hip-Hop", year: 1996, tier: 2 },
  { title: "Vol. 2... Hard Knock Life", artist: "Jay-Z", genre: "Hip-Hop", year: 1998, tier: 1 },
  { title: "All Eyez on Me", artist: "2Pac", genre: "Hip-Hop", year: 1996, tier: 1 },
  { title: "Life After Death", artist: "The Notorious B.I.G.", genre: "Hip-Hop", year: 1997, tier: 1 },
  { title: "Stakes Is High", artist: "De La Soul", genre: "Hip-Hop", year: 1996, tier: 3 },

  // Electronic (10)
  { title: "Homework", artist: "Daft Punk", genre: "Electronic", year: 1997, tier: 2 },
  { title: "Discovery", artist: "Daft Punk", genre: "Electronic", year: 2001, tier: 2 },
  { title: "Play", artist: "Moby", genre: "Electronic", year: 1999, tier: 1 },
  { title: "The Fat of the Land", artist: "The Prodigy", genre: "Electronic", year: 1997, tier: 1 },
  { title: "Music Has the Right to Children", artist: "Boards of Canada", genre: "Electronic", year: 1998, tier: 3 },
  { title: "Endtroducing.....", artist: "DJ Shadow", genre: "Electronic", year: 1996, tier: 2 },
  { title: "Dig Your Own Hole", artist: "The Chemical Brothers", genre: "Electronic", year: 1997, tier: 2 },
  { title: "Surrender", artist: "The Chemical Brothers", genre: "Electronic", year: 1999, tier: 2 },
  { title: "Moon Safari", artist: "Air", genre: "Electronic", year: 1998, tier: 3 },
  { title: "Selected Ambient Works Volume II", artist: "Aphex Twin", genre: "Electronic", year: 1994, tier: 3 },

  // Metal/Punk (12)
  { title: "Follow the Leader", artist: "Korn", genre: "Metal/Punk", year: 1998, tier: 1 },
  { title: "Issues", artist: "Korn", genre: "Metal/Punk", year: 1999, tier: 1 },
  { title: "Around the Fur", artist: "Deftones", genre: "Metal/Punk", year: 1997, tier: 2 },
  { title: "White Pony", artist: "Deftones", genre: "Metal/Punk", year: 2000, tier: 2 },
  { title: "...And Out Come the Wolves", artist: "Rancid", genre: "Metal/Punk", year: 1995, tier: 2 },
  { title: "Punk in Drublic", artist: "NOFX", genre: "Metal/Punk", year: 1994, tier: 3 },
  { title: "Smash", artist: "The Offspring", genre: "Metal/Punk", year: 1994, tier: 2 },
  { title: "Toxicity", artist: "System of a Down", genre: "Metal/Punk", year: 2001, tier: 2 },
  { title: "System of a Down", artist: "System of a Down", genre: "Metal/Punk", year: 1998, tier: 2 },
  { title: "The Downward Spiral", artist: "Nine Inch Nails", genre: "Metal/Punk", year: 1994, tier: 2 },
  { title: "The Fragile", artist: "Nine Inch Nails", genre: "Metal/Punk", year: 1999, tier: 2 },
  { title: "Antichrist Superstar", artist: "Marilyn Manson", genre: "Metal/Punk", year: 1996, tier: 2 },

  // Classic Rock (15 — back catalog staples always in stock)
  { title: "Led Zeppelin IV", artist: "Led Zeppelin", genre: "Classic Rock", year: 1971, tier: 1 },
  { title: "Dark Side of the Moon", artist: "Pink Floyd", genre: "Classic Rock", year: 1973, tier: 1 },
  { title: "The Wall", artist: "Pink Floyd", genre: "Classic Rock", year: 1979, tier: 2 },
  { title: "Abbey Road", artist: "The Beatles", genre: "Classic Rock", year: 1969, tier: 1 },
  { title: "Revolver", artist: "The Beatles", genre: "Classic Rock", year: 1966, tier: 2 },
  { title: "Rumours", artist: "Fleetwood Mac", genre: "Classic Rock", year: 1977, tier: 1 },
  { title: "Who's Next", artist: "The Who", genre: "Classic Rock", year: 1971, tier: 2 },
  { title: "Appetite for Destruction", artist: "Guns N' Roses", genre: "Classic Rock", year: 1987, tier: 1 },
  { title: "Back in Black", artist: "AC/DC", genre: "Classic Rock", year: 1980, tier: 1 },
  { title: "Nevermind", artist: "Nirvana", genre: "Classic Rock", year: 1991, tier: 1 },
  { title: "In Utero", artist: "Nirvana", genre: "Classic Rock", year: 1993, tier: 2 },
  { title: "Ten", artist: "Pearl Jam", genre: "Classic Rock", year: 1991, tier: 1 },
  { title: "Tragic Kingdom", artist: "No Doubt", genre: "Classic Rock", year: 1995, tier: 2 },
  { title: "Jagged Little Pill", artist: "Alanis Morissette", genre: "Classic Rock", year: 1995, tier: 1 },
  { title: "Superunknown", artist: "Soundgarden", genre: "Classic Rock", year: 1994, tier: 2 },

  // Country (8)
  { title: "Wide Open Spaces", artist: "Dixie Chicks", genre: "Country", year: 1998, tier: 1 },
  { title: "Fly", artist: "Dixie Chicks", genre: "Country", year: 1999, tier: 1 },
  { title: "Come On Over", artist: "Shania Twain", genre: "Country", year: 1997, tier: 1 },
  { title: "Breathe", artist: "Faith Hill", genre: "Country", year: 1999, tier: 2 },
  { title: "A Place in the Sun", artist: "Tim McGraw", genre: "Country", year: 1999, tier: 2 },
  { title: "Sevens", artist: "Garth Brooks", genre: "Country", year: 1997, tier: 1 },
  { title: "Car Wheels on a Gravel Road", artist: "Lucinda Williams", genre: "Country", year: 1998, tier: 3 },
  { title: "I Feel Alright", artist: "Steve Earle", genre: "Country", year: 1996, tier: 3 },

  // R&B/Soul (8)
  { title: "Voodoo", artist: "D'Angelo", genre: "R&B/Soul", year: 2000, tier: 2 },
  { title: "Brown Sugar", artist: "D'Angelo", genre: "R&B/Soul", year: 1995, tier: 2 },
  { title: "Baduizm", artist: "Erykah Badu", genre: "R&B/Soul", year: 1997, tier: 2 },
  { title: "FanMail", artist: "TLC", genre: "R&B/Soul", year: 1999, tier: 1 },
  { title: "CrazySexyCool", artist: "TLC", genre: "R&B/Soul", year: 1994, tier: 1 },
  { title: "The Writing's on the Wall", artist: "Destiny's Child", genre: "R&B/Soul", year: 1999, tier: 1 },
  { title: "My Life", artist: "Mary J. Blige", genre: "R&B/Soul", year: 1994, tier: 2 },
  { title: "When Disaster Strikes...", artist: "Busta Rhymes", genre: "R&B/Soul", year: 1997, tier: 2 },

  // Jazz/Blues (7)
  { title: "Kind of Blue", artist: "Miles Davis", genre: "Jazz/Blues", year: 1959, tier: 2 },
  { title: "A Love Supreme", artist: "John Coltrane", genre: "Jazz/Blues", year: 1965, tier: 2 },
  { title: "Time Out", artist: "Dave Brubeck", genre: "Jazz/Blues", year: 1959, tier: 3 },
  { title: "Buena Vista Social Club", artist: "Buena Vista Social Club", genre: "Jazz/Blues", year: 1997, tier: 2 },
  { title: "King of the Delta Blues Singers", artist: "Robert Johnson", genre: "Jazz/Blues", year: 1961, tier: 3 },
  { title: "From the Cradle", artist: "Eric Clapton", genre: "Jazz/Blues", year: 1994, tier: 2 },
  { title: "Don't Give Up on Me", artist: "Solomon Burke", genre: "Jazz/Blues", year: 2002, tier: 3 },
];

/* ═══════════════════════════════════════════
   LONG-TAIL ARTIST/TITLE BANKS PER GENRE
   Used to generate the ~1200 deep-catalog items
   ═══════════════════════════════════════════ */

const ARTIST_BANKS = {
  "Alternative": [
    "Guided by Voices", "Pavement", "Built to Spill", "Sonic Youth", "The Flaming Lips",
    "Yo La Tengo", "Sleater-Kinney", "Liz Phair", "Wilco", "Spoon",
    "The Breeders", "Archers of Loaf", "Superchunk", "Dinosaur Jr.", "Sebadoh",
    "Cat Power", "The Promise Ring", "Jimmy Eat World", "Sunny Day Real Estate", "Mineral",
    "Rainer Maria", "Pedro the Lion", "The Get Up Kids", "American Football", "Cap'n Jazz",
    "Jawbreaker", "Texas Is the Reason", "Karate", "Mogwai", "Tortoise",
    "Slint", "The Sea and Cake", "Stereolab", "Cornershop", "Travis",
    "Toad the Wet Sprocket", "Better Than Ezra", "Third Eye Blind", "Semisonic", "Fastball",
  ],
  "Hip-Hop": [
    "A Tribe Called Quest", "Wu-Tang Clan", "Nas", "Redman", "Method Man",
    "Beastie Boys", "Fugees", "Goodie Mob", "Bone Thugs-N-Harmony", "DMX",
    "Juvenile", "Master P", "UGK", "Scarface", "Big Pun",
    "Company Flow", "Blackstar", "Pharoahe Monch", "Canibus", "Cam'ron",
    "Raekwon", "GZA", "Ol' Dirty Bastard", "Mobb Deep", "Gang Starr",
  ],
  "Electronic": [
    "Underworld", "Orbital", "Autechre", "Squarepusher", "Massive Attack",
    "Portishead", "Tricky", "Bjork", "Goldfrapp", "Sneaker Pimps",
    "UNKLE", "Faithless", "Leftfield", "Groove Armada", "Basement Jaxx",
    "Roni Size", "LTJ Bukem", "Carl Cox", "Paul Oakenfold", "Fatboy Slim",
  ],
  "Metal/Punk": [
    "Converge", "Botch", "Refused", "At the Drive-In", "Glassjaw",
    "Hatebreed", "Earth Crisis", "Snapcase", "Sick of It All", "Agnostic Front",
    "Neurosis", "Isis", "Pelican", "Sleep", "Electric Wizard",
    "Pantera", "Sepultura", "Fear Factory", "Machine Head", "Coal Chamber",
    "AFI", "Bad Religion", "Pennywise", "MxPx", "Less Than Jake",
  ],
  "Classic Rock": [
    "Jimi Hendrix", "Cream", "Deep Purple", "Black Sabbath", "Aerosmith",
    "ZZ Top", "Lynyrd Skynyrd", "The Allman Brothers Band", "Creedence Clearwater Revival", "Tom Petty",
    "Bruce Springsteen", "Bob Dylan", "Neil Young", "The Rolling Stones", "David Bowie",
    "Queen", "The Doors", "Santana", "Stevie Ray Vaughan", "Grateful Dead",
  ],
  "Country": [
    "Lyle Lovett", "Dwight Yoakam", "Alan Jackson", "George Strait", "Brooks & Dunn",
    "Toby Keith", "Vince Gill", "Reba McEntire", "Trisha Yearwood", "Mary Chapin Carpenter",
    "Emmylou Harris", "Gillian Welch", "Iris DeMent", "Nanci Griffith", "Townes Van Zandt",
  ],
  "R&B/Soul": [
    "Aaliyah", "Brandy", "Monica", "Usher", "Ginuwine",
    "Maxwell", "Musiq Soulchild", "Jill Scott", "Angie Stone", "Anthony Hamilton",
    "Jaheim", "Carl Thomas", "Joe", "Brian McKnight", "Blackstreet",
  ],
  "Jazz/Blues": [
    "Medeski Martin & Wood", "Brad Mehldau", "Joshua Redman", "Pat Metheny", "Herbie Hancock",
    "Cassandra Wilson", "Diana Krall", "Norah Jones", "Buddy Guy", "Keb' Mo'",
    "Taj Mahal", "Chris Whitley", "Jonny Lang", "Kenny Wayne Shepherd", "Gov't Mule",
  ],
};

const ALBUM_TITLE_PARTS = {
  prefixes: [
    "The", "A", "Songs from", "Notes on", "Return to", "Beyond", "Under", "Between",
    "Welcome to", "Tales of", "Stories from", "Echoes of", "Sounds of", "Into the",
  ],
  nouns: [
    "Midnight", "Silence", "Highway", "River", "Thunder", "Morning", "Autumn", "Summer",
    "Winter", "Shadow", "Light", "Fire", "Rain", "Storm", "Dust", "Smoke", "Glass",
    "Stone", "Iron", "Silver", "Golden", "Broken", "Electric", "Static", "Velvet",
    "Hollow", "Crimson", "Signal", "Frequency", "Voltage", "Transmission", "Broadcast",
  ],
  suffixes: [
    "Sessions", "Chronicles", "Diaries", "Letters", "Tapes", "Files", "Days", "Nights",
    "Hours", "Years", "Songs", "Dreams", "Stories", "Pieces", "Fragments", "Revisions",
  ],
};

function generateAlbumTitle(rand) {
  const r = rand();
  const { prefixes, nouns, suffixes } = ALBUM_TITLE_PARTS;
  if (r < 0.35) {
    return prefixes[Math.floor(rand() * prefixes.length)] + " " +
           nouns[Math.floor(rand() * nouns.length)];
  } else if (r < 0.65) {
    return nouns[Math.floor(rand() * nouns.length)] + " " +
           suffixes[Math.floor(rand() * suffixes.length)];
  } else if (r < 0.85) {
    return prefixes[Math.floor(rand() * prefixes.length)] + " " +
           nouns[Math.floor(rand() * nouns.length)] + " " +
           suffixes[Math.floor(rand() * suffixes.length)];
  } else {
    return nouns[Math.floor(rand() * nouns.length)];
  }
}

/* ═══════════════════════════════════════════
   CATALOG GENERATOR
   ═══════════════════════════════════════════ */

function generateCatalog() {
  const rand = seededRand(7777);
  const catalog = [];
  let id = 1;

  const storeShares = { bardstown: 0.55, middletown: 0.17, newalbany: 0.15, dixie: 0.13 };

  function addStoreBreakdown(item, totalUnitsNew, totalUnitsUsed) {
    item.storeUnits = {};
    STORES.forEach((s) => {
      const share = storeShares[s.key];
      const jitter = 0.85 + rand() * 0.3;
      item.storeUnits[s.key] = {
        unitsNew: Math.max(0, Math.round(totalUnitsNew * share * jitter)),
        unitsUsed: Math.max(0, Math.round(totalUnitsUsed * share * jitter)),
      };
    });
  }

  function cdPrice(rand) { return +(11.99 + rand() * 5.00).toFixed(2); }
  function cdUsedPrice(rand) { return +(5.99 + rand() * 4.00).toFixed(2); }
  function vinylPrice(rand) { return +(14.99 + rand() * 8.00).toFixed(2); }
  function vinylUsedPrice(rand) { return +(4.99 + rand() * 8.00).toFixed(2); }
  function cassettePrice(rand) { return +(7.99 + rand() * 2.00).toFixed(2); }

  // Tier unit ranges
  const tierUnits = {
    1: { min: 1500, max: 3200 },
    2: { min: 500, max: 1500 },
    3: { min: 100, max: 500 },
  };

  // ── SEED ALBUMS: Expand to format variants ──
  SEED_ALBUMS.forEach((album) => {
    const { min, max } = tierUnits[album.tier];
    const isOldRelease = album.year < 1990;

    // CD variant (almost always)
    if (rand() < 0.92) {
      const baseUnits = Math.round(min + rand() * (max - min));
      const unitsNew = isOldRelease ? Math.round(baseUnits * 0.5) : baseUnits;
      const unitsUsed = Math.round(unitsNew * (0.06 + rand() * 0.08)); // CD: ~8-12% used
      const item = {
        id: id++,
        title: album.title,
        artist: album.artist,
        genre: album.genre,
        format: "CD",
        category: "Music",
        priceNew: cdPrice(rand),
        priceUsed: cdUsedPrice(rand),
        unitsNew,
        unitsUsed,
      };
      item.revenue = +(item.unitsNew * item.priceNew + item.unitsUsed * item.priceUsed).toFixed(2);
      addStoreBreakdown(item, unitsNew, unitsUsed);
      catalog.push(item);
    }

    // Vinyl variant (rare in late 90s — ~12% of titles, mostly older/indie releases)
    const vinylChance = isOldRelease ? 0.35 : (album.tier === 3 ? 0.15 : 0.08);
    if (rand() < vinylChance) {
      const baseUnits = Math.round((min * 0.15) + rand() * (min * 0.25));
      // Used vinyl outsells new vinyl in the 90s
      const unitsNew = Math.round(baseUnits * 0.4);
      const unitsUsed = Math.round(baseUnits * 0.6);
      const item = {
        id: id++,
        title: album.title,
        artist: album.artist,
        genre: album.genre,
        format: "Vinyl",
        category: "Music",
        priceNew: vinylPrice(rand),
        priceUsed: vinylUsedPrice(rand),
        unitsNew,
        unitsUsed,
      };
      item.revenue = +(item.unitsNew * item.priceNew + item.unitsUsed * item.priceUsed).toFixed(2);
      addStoreBreakdown(item, unitsNew, unitsUsed);
      catalog.push(item);
    }

    // Cassette variant (declining, ~18% of titles)
    if (rand() < 0.18) {
      const baseUnits = Math.round((min * 0.1) + rand() * (min * 0.15));
      const item = {
        id: id++,
        title: album.title,
        artist: album.artist,
        genre: album.genre,
        format: "Cassette",
        category: "Music",
        priceNew: cassettePrice(rand),
        priceUsed: 0,
        unitsNew: baseUnits,
        unitsUsed: 0, // No used cassettes
      };
      item.revenue = +(item.unitsNew * item.priceNew).toFixed(2);
      addStoreBreakdown(item, baseUnits, 0);
      catalog.push(item);
    }
  });

  // ── LONG-TAIL GENERATION: ~1200 deep-catalog items ──
  const genreWeights = [25, 15, 10, 12, 15, 8, 8, 7]; // matches genre distribution

  for (let i = 0; i < 1200; i++) {
    const genre = pickWeighted(rand, GENRES, genreWeights);
    const artists = ARTIST_BANKS[genre];
    const artist = artists[Math.floor(rand() * artists.length)];
    const title = generateAlbumTitle(rand);

    // Determine format
    const formatRoll = rand();
    let format, priceNew, priceUsed, unitsNew, unitsUsed;

    if (formatRoll < 0.78) {
      // CD
      format = "CD";
      priceNew = cdPrice(rand);
      priceUsed = cdUsedPrice(rand);
      const base = Math.round(5 + rand() * 195); // 5-200 units
      unitsNew = base;
      unitsUsed = Math.round(base * (0.05 + rand() * 0.1));
    } else if (formatRoll < 0.90) {
      // Vinyl — used outsells new
      format = "Vinyl";
      priceNew = vinylPrice(rand);
      priceUsed = vinylUsedPrice(rand);
      const base = Math.round(3 + rand() * 80); // 3-83 units total
      unitsNew = Math.round(base * (0.3 + rand() * 0.2)); // 30-50% new
      unitsUsed = base - unitsNew; // rest is used
      // Some vinyl items are used-only (no new pressing)
      if (rand() < 0.25) {
        unitsNew = 0;
        unitsUsed = base;
      }
    } else {
      // Cassette — no used
      format = "Cassette";
      priceNew = cassettePrice(rand);
      priceUsed = 0;
      unitsNew = Math.round(3 + rand() * 100);
      unitsUsed = 0;
    }

    const item = {
      id: id++,
      title,
      artist,
      genre,
      format,
      category: "Music",
      priceNew,
      priceUsed,
      unitsNew,
      unitsUsed,
    };
    item.revenue = +(item.unitsNew * item.priceNew + item.unitsUsed * item.priceUsed).toFixed(2);
    addStoreBreakdown(item, unitsNew, unitsUsed);
    catalog.push(item);
  }

  // ── MERCH CATALOG: ~175 items with specific names ──
  const MERCH_DEFS = [
    // T-Shirts (~40)
    ...generateMerchItems(rand, "T-Shirt", 40, [
      "Ear X-tacy Logo Tee (Black)", "Ear X-tacy Logo Tee (White)", "Ear X-tacy Logo Tee (Red)",
      "Ear X-tacy Vintage Logo", "Bardstown Rd Store Tee", "Louisville Vinyl Club",
      "Support Local Music", "Ear X-tacy Est. 1985", "Record Store Staff Pick",
      "Listen Local Tee", "Crate Digger Society", "Vinyl Junkie",
    ], 16, 24, 80, 2200),
    // Posters (~30)
    ...generateMerchItems(rand, "Poster", 30, [
      "Ear X-tacy Storefront Print", "Bardstown Rd Map Poster", "Record Store Day 1999",
      "In-Store Live Series Poster", "Louisville Music Scene", "Vinyl Collection Guide",
      "Genre Wall Chart", "New Releases Weekly", "Staff Picks Dec '99",
    ], 5, 15, 30, 800),
    // Stickers (~40)
    ...generateMerchItems(rand, "Sticker", 40, [
      "Ear X-tacy Logo (Circle)", "Ear X-tacy Logo (Rectangle)", "I Shop at Ear X-tacy",
      "Louisville Record Store", "Crate Digger", "Vinyl Life", "Support Indie Music",
      "WFPK Collab Sticker", "Bardstown Rd Sticker",
    ], 1, 3, 200, 3500),
    // Patches (~15)
    ...generateMerchItems(rand, "Patch", 15, [
      "Ear X-tacy Iron-On", "Louisville KY Patch", "Record Player Patch",
      "Vinyl Collector Patch",
    ], 4, 6, 40, 500),
    // Pins (~15)
    ...generateMerchItems(rand, "Pin", 15, [
      "Ear X-tacy Enamel Pin", "Record Player Pin", "Louisville Pin",
      "Vinyl Pin", "Headphones Pin",
    ], 3, 5, 50, 600),
    // Tote Bags (~10)
    ...generateMerchItems(rand, "Tote Bag", 10, [
      "Ear X-tacy Canvas Tote", "Record Bag (Black)", "Record Bag (Natural)",
      "Louisville Music Tote",
    ], 12, 18, 30, 400),
    // Hats (~10)
    ...generateMerchItems(rand, "Hat", 10, [
      "Ear X-tacy Dad Hat (Black)", "Ear X-tacy Dad Hat (Navy)", "Ear X-tacy Beanie",
      "Louisville Snapback",
    ], 14, 20, 40, 500),
    // Bumper Stickers (~15)
    ...generateMerchItems(rand, "Bumper Sticker", 15, [
      "I'd Rather Be at Ear X-tacy", "Honk If You Love Vinyl", "Louisville Record Store",
      "Support Local Music", "Ear X-tacy Bumper",
    ], 1, 2, 150, 2000),
  ];

  MERCH_DEFS.forEach((item) => {
    item.id = id++;
    catalog.push(item);
  });

  return catalog;
}

function generateMerchItems(rand, merchType, count, namedItems, priceMin, priceMax, unitsMin, unitsMax) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const title = i < namedItems.length
      ? namedItems[i]
      : `${merchType} Design #${i + 1}`;
    const priceNew = +(priceMin + rand() * (priceMax - priceMin)).toFixed(2);
    const unitsNew = Math.round(unitsMin + rand() * (unitsMax - unitsMin));
    const item = {
      title,
      artist: "\u2014",
      genre: null,
      format: "\u2014",
      category: "Merch",
      merchType,
      priceNew,
      priceUsed: 0,
      unitsNew,
      unitsUsed: 0,
      revenue: +(unitsNew * priceNew).toFixed(2),
      storeUnits: {},
    };
    const storeShares = { bardstown: 0.55, middletown: 0.17, newalbany: 0.15, dixie: 0.13 };
    STORES.forEach((s) => {
      const jitter = 0.85 + rand() * 0.3;
      item.storeUnits[s.key] = {
        unitsNew: Math.max(0, Math.round(unitsNew * storeShares[s.key] * jitter)),
        unitsUsed: 0,
      };
    });
    items.push(item);
  }
  return items;
}

export const CATALOG = generateCatalog();

/* ═══════════════════════════════════════════
   TOP SELLERS (derived from catalog)
   ═══════════════════════════════════════════ */

export const TOP_SELLERS = [...CATALOG]
  .filter((i) => i.category === "Music")
  .sort((a, b) => (b.unitsNew + b.unitsUsed) - (a.unitsNew + a.unitsUsed))
  .slice(0, 8)
  .map((item, i) => ({
    rank: i + 1,
    title: item.title,
    artist: item.artist,
    format: item.format,
    units: item.unitsNew + item.unitsUsed,
  }));

/* ═══════════════════════════════════════════
   EXPENSE DATA — Monthly Granularity
   ═══════════════════════════════════════════ */

export const PAYROLL_ROLES = [
  { role: "Store Manager", count: 4, avgMonthly: 3500 },
  { role: "Asst. Manager", count: 4, avgMonthly: 2600 },
  { role: "Floor Staff (FT)", count: 12, avgMonthly: 1800 },
  { role: "Floor Staff (PT)", count: 18, avgMonthly: 1000 },
  { role: "Buyer / Inventory", count: 2, avgMonthly: 3000 },
  { role: "Admin / Bookkeeper", count: 1, avgMonthly: 2600 },
];

export const RENT_DATA = [
  { store: "Bardstown Rd", key: "bardstown", sqft: 8200, rents: [6800, 7000, 7200] },
  { store: "Middletown", key: "middletown", sqft: 3400, rents: [3200, 3300, 3400] },
  { store: "New Albany", key: "newalbany", sqft: 2800, rents: [2400, 2450, 2500] },
  { store: "Dixie Hwy", key: "dixie", sqft: 2600, rents: [2100, 2150, 2200] },
];

export const AD_CHANNELS = [
  { channel: "Billboards (I-64/I-65)", base: 4200, color: C.pink },
  { channel: "Radio (WFPK, WLRS)", base: 3100, color: C.yellow },
  { channel: "LEO Weekly / Print", base: 1800, color: C.green },
  { channel: "In-Store Events", base: 1200, color: C.cyan },
  { channel: "Event Sponsorships", base: 600, color: C.orange },
];

function generateExpenseData() {
  const rand = seededRand(9999);
  const data = [];
  const years = [1998, 1999, 2000];
  const yearIdx = { 1998: 0, 1999: 1, 2000: 2 };
  const seasonality = [0.85, 0.78, 0.88, 0.92, 0.95, 0.88, 0.82, 0.80, 0.90, 0.95, 1.10, 1.35];

  // Payroll base per store (monthly, pre-tax/benefits)
  const payrollBase = { bardstown: 28500, middletown: 12800, newalbany: 11200, dixie: 10500 };
  const benefitsMult = 1.22; // payroll taxes + benefits

  years.forEach((year, yi) => {
    MONTHS_SHORT.forEach((month, mi) => {
      const label = `${month} '${String(year).slice(2)}`;
      const row = { month: label, year, monthIdx: mi };

      // ── PAYROLL ──
      let payrollTotal = 0;
      row.payrollByStore = {};
      STORES.forEach((s) => {
        const annualRaise = 1 + (yi * 0.03); // ~3% raises per year
        const holidayOT = mi === 11 ? 1.15 : 1.0; // Dec overtime
        const turnoverDip = (rand() < 0.08) ? 0.92 : 1.0; // occasional vacancy
        const jitter = 0.97 + rand() * 0.06;
        const val = Math.round(payrollBase[s.key] * benefitsMult * annualRaise * holidayOT * turnoverDip * jitter);
        row.payrollByStore[s.key] = val;
        payrollTotal += val;
      });
      row.payroll = payrollTotal;

      // ── RENT ──
      let rentTotal = 0;
      row.rentByStore = {};
      RENT_DATA.forEach((r) => {
        const monthlyRent = r.rents[yi];
        const cam = Math.round(r.sqft * 0.50); // CAM charges
        const val = monthlyRent + cam;
        row.rentByStore[r.key] = val;
        rentTotal += val;
      });
      row.rent = rentTotal;

      // ── INVENTORY / COGS ──
      // Tracks revenue with ~2 month lead and Q4 stocking spike
      const revenueMonth = monthlyData[yi * 12 + mi];
      const revBase = revenueMonth ? revenueMonth.total : 260000;
      const leadMultiplier = mi >= 9 ? 1.25 : (mi >= 7 ? 1.10 : 1.0); // Oct-Dec stocking
      const inventoryJitter = 0.92 + rand() * 0.16;
      const newStock = Math.round(revBase * 0.28 * leadMultiplier * inventoryJitter);
      const usedAcquisition = Math.round(revBase * 0.03 * (0.85 + rand() * 0.3));
      const shrinkage = Math.round((newStock + usedAcquisition) * 0.015);
      row.inventoryNew = newStock;
      row.inventoryUsed = usedAcquisition;
      row.inventoryShrinkage = shrinkage;
      row.inventory = newStock + usedAcquisition + shrinkage;

      // ── ADVERTISING ──
      const adGrowth = 1 + (yi * 0.05); // 5% YoY
      const holidayAdBoost = mi >= 9 && mi <= 11 ? 1.20 : 1.0;
      let adTotal = 0;
      row.adByChannel = {};
      AD_CHANNELS.forEach((ch) => {
        const isStatic = ch.channel.includes("Billboard");
        const seasonal = isStatic ? 1.0 : holidayAdBoost;
        const jitter = isStatic ? 1.0 : (0.9 + rand() * 0.2);
        const val = Math.round(ch.base * adGrowth * seasonal * jitter);
        row.adByChannel[ch.channel] = val;
        adTotal += val;
      });
      row.advertising = adTotal;

      // ── UTILITIES & OTHER ──
      const summerAC = (mi >= 5 && mi <= 8) ? 1.35 : 1.0; // Jun-Sep AC spike
      const electric = Math.round((800 + rand() * 200) * summerAC);
      const phone = 400;
      const insurance = 1200;
      const supplies = Math.round(300 + rand() * 200);
      const equipment = Math.round(200 + rand() * 200);
      const professional = Math.round(500 + rand() * 200);
      row.utilities = electric + phone + insurance + supplies + equipment + professional;
      row.utilitiesDetail = { electric, phone, insurance, supplies, equipment, professional };

      // ── TOTALS ──
      row.totalExpenses = row.payroll + row.rent + row.inventory + row.advertising + row.utilities;

      data.push(row);
    });
  });

  return data;
}

export const expenseData = generateExpenseData();

/* ═══════════════════════════════════════════
   EXPENSE CATEGORY SUMMARY (for donut chart)
   ═══════════════════════════════════════════ */

export const EXPENSE_CATEGORIES = [
  { name: "Payroll", key: "payroll", color: C.pink },
  { name: "Inventory", key: "inventory", color: C.cyan },
  { name: "Rent", key: "rent", color: C.yellow },
  { name: "Advertising", key: "advertising", color: C.orange },
  { name: "Utilities & Other", key: "utilities", color: C.dim },
];

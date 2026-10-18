// Downloads charades images from Wikipedia.
// 1) Batched action-API call to resolve title -> image URL for all titles.
// 2) Per-item download from upload.wikimedia.org.
// Skips names that already exist in pictures/raw/.

const fs = require("fs");
const path = require("path");
const https = require("https");

const RAW_DIR = path.resolve(__dirname, "..", "pictures", "raw");
const UA = "charades-game (personal project; omer.sher@ludeo.com)";

const items = {
  // Food & drinks
  "בננה":        "Banana",
  "אבטיח":       "Watermelon",
  "תות":         "Strawberry",
  "אננס":        "Pineapple",
  "עגבנייה":     "Tomato",
  "גלידה":       "Ice_cream",
  "עוגה":        "Cake",
  "דונאט":       "Doughnut",
  "גבינה":       "Cheese",
  "ביצה":        "Egg_(food)",
  "מרק":         "Soup",
  "סלט":         "Salad",

  // Animals
  "כלב":         "Dog",
  "סוס":         "Horse",
  "פרה":         "Cattle",
  "דג":          "Fish",
  "עכבר":        "Mouse",
  "גירפה":       "Giraffe",
  "זברה":        "Zebra",
  "קנגורו":      "Kangaroo",
  "פנדה":        "Giant_panda",
  "פינגווין":    "Penguin",
  "דולפין":      "Dolphin",
  "ינשוף":       "Owl",
  "פרפר":        "Butterfly",
  "דבורה":       "Bee",

  // Professions / people
  "רופא":        "Doctor_(title)",
  "כבאי":        "Firefighter",
  "שוטר":        "Police_officer",
  "טבח":         "Chef",
  "טייס":        "Aircraft_pilot",
  "שופט":        "Judge",
  "נינגה":       "Ninja",
  "איינשטיין":   "Albert_Einstein",
  "נפוליאון":    "Napoleon",
  "שייקספיר":    "William_Shakespeare",

  // Everyday objects
  "מטרייה":      "Umbrella",
  "משקפיים":     "Glasses",
  "אופניים":     "Bicycle",
  "אוטובוס":     "Bus",
  "רכבת":        "Train",
  "צוללת":       "Submarine",
  "מספריים":     "Scissors",
  "שעון יד":     "Watch",
  "כיסא":        "Chair",
  "ספה":         "Couch",
  "מנורה":       "Light_fixture",
  "מצלמה":       "Camera",
  "גיטרה":       "Guitar",
  "כדורגל":      "Ball_(association_football)",
};

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"];

function alreadyExists(baseName) {
  return IMAGE_EXTS.some((ext) =>
    fs.existsSync(path.join(RAW_DIR, baseName + ext))
  );
}

function httpGet(url, asText) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": UA, Accept: asText ? "application/json" : "*/*" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpGet(res.headers.location, asText).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          const err = new Error(`HTTP ${res.statusCode}`);
          err.status = res.statusCode;
          return reject(err);
        }
        if (asText) {
          let buf = "";
          res.setEncoding("utf8");
          res.on("data", (c) => (buf += c));
          res.on("end", () => resolve(buf));
        } else {
          resolve(res);
        }
      })
      .on("error", reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function downloadStreamOnce(url, outPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await httpGet(url, false);
      const file = fs.createWriteStream(outPath);
      res.pipe(file);
      file.on("finish", () => file.close((err) => (err ? reject(err) : resolve())));
      file.on("error", (err) => { fs.unlink(outPath, () => reject(err)); });
    } catch (e) { reject(e); }
  });
}

async function downloadStream(url, outPath) {
  let delay = 4000;
  for (let attempt = 0; attempt < 6; attempt++) {
    try { return await downloadStreamOnce(url, outPath); }
    catch (e) {
      if (e.status === 429 && attempt < 5) { await sleep(delay); delay = Math.min(delay * 2, 60000); continue; }
      throw e;
    }
  }
}

function extFromUrl(url) {
  const noQuery = url.split("?")[0];
  const m = noQuery.match(/\.([a-zA-Z0-9]{2,5})$/);
  if (!m) return ".jpg";
  const ext = "." + m[1].toLowerCase();
  return IMAGE_EXTS.includes(ext) ? ext : ".jpg";
}

async function batchResolveImages(titlesNeeded) {
  // Wikipedia action API accepts up to 50 titles via | separator.
  const titleToUrl = {};
  const chunks = [];
  for (let i = 0; i < titlesNeeded.length; i += 40) chunks.push(titlesNeeded.slice(i, i + 40));

  for (const chunk of chunks) {
    const titles = chunk.map((t) => encodeURIComponent(t)).join("%7C");
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=pageimages&piprop=original|thumbnail&pithumbsize=2000&format=json&formatversion=2&redirects=1`;
    const body = await httpGet(url, true);
    const j = JSON.parse(body);
    const normalized = {};
    if (j.query && j.query.normalized) {
      for (const n of j.query.normalized) normalized[n.to] = n.from;
    }
    if (j.query && j.query.pages) {
      for (const p of j.query.pages) {
        // Prefer thumbnail (capped at pithumbsize) so we don't pull 20MB originals.
        const src = (p.thumbnail && p.thumbnail.source) || (p.original && p.original.source);
        if (!src) continue;
        // Map back to the original requested title.
        const titleUnderscored = p.title.replace(/ /g, "_");
        const originalSent = chunk.find(
          (t) => t === titleUnderscored || t === p.title || normalized[p.title] === t
        );
        if (originalSent) titleToUrl[originalSent] = src;
      }
    }
  }
  return titleToUrl;
}

(async () => {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Raw dir not found: ${RAW_DIR}`);
    process.exit(1);
  }

  // Build worklist: skip items that already exist on disk.
  const work = [];
  const skipped = [];
  for (const [he, title] of Object.entries(items)) {
    if (alreadyExists(he)) skipped.push(he);
    else work.push({ he, title });
  }

  console.log(`To download: ${work.length}   Already on disk: ${skipped.length}`);
  if (work.length === 0) { console.log("Nothing to do."); return; }

  console.log("\nResolving image URLs (batched)...");
  const titles = work.map((w) => w.title);
  let urlMap;
  try {
    urlMap = await batchResolveImages(titles);
  } catch (e) {
    console.error(`Batch API call failed: ${e.message}`);
    process.exit(1);
  }
  console.log(`Resolved ${Object.keys(urlMap).length}/${titles.length} URLs.\n`);

  const succeeded = [];
  const failed = [];

  for (const { he, title } of work) {
    const url = urlMap[title];
    if (!url) {
      console.log(`FAIL   ${he}  (${title}) - no image in API response`);
      failed.push(he);
      continue;
    }
    const ext = extFromUrl(url);
    const outPath = path.join(RAW_DIR, he + ext);
    try {
      await downloadStream(url, outPath);
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`OK     ${he}${ext}  [${kb} KB]  <- ${title}`);
      succeeded.push(he);
      await sleep(1500);
    } catch (e) {
      console.log(`FAIL   ${he}  (${title}) - ${e.message}`);
      failed.push(he);
    }
  }

  console.log("\n===== SUMMARY =====");
  console.log(`Succeeded: ${succeeded.length}`);
  console.log(`Skipped:   ${skipped.length}`);
  console.log(`Failed:    ${failed.length}`);
  if (failed.length) console.log(`Failed items: ${failed.join(", ")}`);
})();

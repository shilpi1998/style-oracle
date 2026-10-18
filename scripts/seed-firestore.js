const { Firestore } = require("@google-cloud/firestore");
const fs = require("fs");

const GCS_BASE = "https://storage.googleapis.com/style-oracle-images/products";

const products = JSON.parse(fs.readFileSync("/tmp/products.json", "utf-8"));
console.log(`Loaded ${products.length} products`);

// Update image URLs to use GCS
for (const p of products) {
  p.images = p.images.map((img) => {
    const filename = img.split("/").pop();
    return `${GCS_BASE}/${filename}`;
  });
}

async function seed() {
  const db = new Firestore({ projectId: "styleagent-hackathon" });

  const BATCH_SIZE = 20;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = products.slice(i, i + BATCH_SIZE);

    for (const product of chunk) {
      const ref = db.collection("products").doc(product.id);
      batch.set(ref, product);
    }

    await batch.commit();
    console.log(`  Seeded ${Math.min(i + BATCH_SIZE, products.length)}/${products.length}`);
  }

  console.log("Done! All products seeded to Firestore.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

import { SearchServiceClient } from "@google-cloud/discoveryengine";
import { Product } from "./types";
import { getProductById } from "./firestore";

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "styleagent-hackathon";
const LOCATION = "global";
const ENGINE = "style-oracle-engine";

let client: SearchServiceClient;

function getClient() {
  if (!client) {
    client = new SearchServiceClient({
      apiEndpoint: "discoveryengine.googleapis.com",
    });
  }
  return client;
}

export async function semanticSearch(
  query: string,
  maxResults: number = 10
): Promise<Product[]> {
  const servingConfig = `projects/${PROJECT}/locations/${LOCATION}/collections/default_collection/engines/${ENGINE}/servingConfigs/default_search`;

  const response = await getClient().search({
    servingConfig,
    query,
    pageSize: maxResults,
  });

  const searchResults = response[0] || [];
  const products: Product[] = [];
  for (const result of searchResults) {
    const docId = result.document?.id;
    if (docId) {
      const product = await getProductById(docId);
      if (product) products.push(product);
    }
  }

  return products;
}

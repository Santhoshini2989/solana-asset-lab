import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { create, mplCore } from "@metaplex-foundation/mpl-core";

import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Connect to Solana Devnet
const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

// Load our existing wallet
const walletPath = join(homedir(), ".config/solana/id.json");

const secretKey = new Uint8Array(JSON.parse(readFileSync(walletPath, "utf8")));

const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

async function main() {
  // Generate a new NFT asset
  const asset = generateSigner(umi);

  const metadataUri =
    "https://raw.githubusercontent.com/Santhoshini2989/solana-asset-lab/main/metadata/burn-test.json";

  // Create the Burn Test NFT
  await create(umi, {
    asset,
    name: "Burn Test",
    uri: metadataUri,
    owner: umi.identity.publicKey,
  }).sendAndConfirm(umi);

  console.log("Burn Test NFT created successfully!");
  console.log("Asset Address:", asset.publicKey);
  console.log("Owner:", umi.identity.publicKey);

  console.log(
    `Explorer: https://explorer.solana.com/address/${asset.publicKey}?cluster=devnet`,
  );
}

main().catch(console.error);

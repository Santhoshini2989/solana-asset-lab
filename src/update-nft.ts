import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { mplCore, update, fetchAsset } from "@metaplex-foundation/mpl-core";

import {
  publicKey,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Connect to Solana Devnet
const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

// Load our Solana CLI wallet
const walletPath = join(homedir(), ".config/solana/id.json");

const secretKey = new Uint8Array(JSON.parse(readFileSync(walletPath, "utf8")));

const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

// Existing NFT address
const assetAddress = publicKey("3wziwmay3YzAFj1J6ssRA2TG8SFndBnZqhStzHxRiGWd");

// Updated metadata URL
const metadataUri =
  "https://raw.githubusercontent.com/Santhoshini2989/solana-asset-lab/main/metadata/genesis-v2.json";

async function main() {
  // Read existing NFT
  const before = await fetchAsset(umi, assetAddress);

  console.log("Previous Name:", before.name);
  console.log("Previous URI:", before.uri);

  // Update NFT metadata
  await update(umi, {
    asset: before,
    name: "Genesis",
    uri: metadataUri,
  }).sendAndConfirm(umi);

  console.log("NFT update transaction confirmed!");

  console.log(
    `Explorer: https://explorer.solana.com/address/${assetAddress}?cluster=devnet`,
  );
}

main().catch(console.error);

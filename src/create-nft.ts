import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { create, fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";

import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Initialize Umi on Devnet
const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

// Load existing Solana CLI wallet
const walletPath = join(homedir(), ".config/solana/id.json");

const secretKey = new Uint8Array(JSON.parse(readFileSync(walletPath, "utf8")));

const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

async function main() {
  // Generate a new Core Asset signer
  const asset = generateSigner(umi);

  const metadataUri =
    "https://raw.githubusercontent.com/Santhoshini2989/solana-asset-lab/main/metadata/genesis.json";

  // Create NFT on Solana Devnet
  await create(umi, {
    asset,
    name: "Santhoshini Genesis",
    uri: metadataUri,
    owner: umi.identity.publicKey,
  }).sendAndConfirm(umi);

  console.log("NFT Address:", asset.publicKey);

  // Fetch and verify on-chain asset
  const nft = await fetchAsset(umi, asset.publicKey);

  console.log("Name:", nft.name);
  console.log("Owner:", nft.owner);
  console.log("Update Authority:", nft.updateAuthority);
  console.log("Metadata URI:", nft.uri);

  console.log(
    `Explorer: https://explorer.solana.com/address/${asset.publicKey}?cluster=devnet`,
  );
}

main().catch(console.error);

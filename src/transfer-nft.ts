import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { mplCore, transfer, fetchAsset } from "@metaplex-foundation/mpl-core";

import {
  publicKey,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Connect to Devnet
const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

// Load current owner's wallet
const walletPath = join(homedir(), ".config/solana/id.json");

const secretKey = new Uint8Array(JSON.parse(readFileSync(walletPath, "utf8")));

const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

const assetAddress = publicKey("3wziwmay3YzAFj1J6ssRA2TG8SFndBnZqhStzHxRiGWd");

const recipient = publicKey("GY3Ccf4NQipsVk96e3CShfwNW6Sxi3nkj7LTZRtiGqx4");

async function main() {
  // Fetch existing NFT
  const asset = await fetchAsset(umi, assetAddress);

  console.log("NFT:", asset.name);
  console.log("Previous Owner:", asset.owner);

  if (asset.owner !== signer.publicKey) {
    throw new Error("Current signer is not the NFT owner");
  }

  // Transfer ownership
  await transfer(umi, {
    asset,
    newOwner: recipient,
  }).sendAndConfirm(umi);

  console.log("NFT transfer confirmed!");
  console.log("New Owner:", recipient);

  console.log(
    `Explorer: https://explorer.solana.com/address/${assetAddress}?cluster=devnet`,
  );
}

main().catch(console.error);

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { burn, fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";

import {
  publicKey,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const rpcUrl = "https://api.devnet.solana.com";

const umi = createUmi(rpcUrl).use(mplCore());
const connection = new Connection(rpcUrl, "confirmed");

// Load primary wallet
const walletPath = join(homedir(), ".config/solana/id.json");

const secretKey = new Uint8Array(JSON.parse(readFileSync(walletPath, "utf8")));

const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

// Only the Burn Test NFT
const assetAddress = publicKey("rcGAi7hECdpySR2qvoE25yxGy1YW7YjvsvyD15rgEdy");

async function main() {
  const asset = await fetchAsset(umi, assetAddress);

  console.log("NFT:", asset.name);
  console.log("Owner:", asset.owner);

  // Safety checks
  if (asset.name !== "Burn Test") {
    throw new Error("This is not the Burn Test NFT!");
  }

  if (asset.owner !== signer.publicKey) {
    throw new Error("Wallet does not own this NFT!");
  }

  if (!asset.uri.endsWith("/metadata/burn-test.json")) {
    throw new Error("Unexpected NFT metadata URI!");
  }

  const address = new PublicKey(assetAddress);

  const accountBefore = await connection.getAccountInfo(address);

  if (!accountBefore) {
    throw new Error("NFT account not found!");
  }

  console.log(
    "Account Balance Before:",
    accountBefore.lamports / LAMPORTS_PER_SOL,
    "SOL",
  );

  // Permanently burn NFT
  await burn(umi, {
    asset,
  }).sendAndConfirm(umi);

  console.log("NFT burned successfully!");
  console.log("Burn transaction confirmed!");

  console.log(
    `Explorer: https://explorer.solana.com/address/${assetAddress}?cluster=devnet`,
  );
}

main().catch(console.error);

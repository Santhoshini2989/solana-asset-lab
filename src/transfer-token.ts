import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

import {
  getOrCreateAssociatedTokenAccount,
  transferChecked,
  getAccount,
  getMint,
} from "@solana/spl-token";

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Connect to Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load sender wallet
const walletPath = join(homedir(), ".config/solana/id.json");

const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(walletPath, "utf8"))),
);

// Existing token mint
const mint = new PublicKey("8UeLzTVCiDS36niFCaSkgjSjrbivsNp9pruvGbtXnMQZ");

// Recipient wallet
const recipient = new PublicKey("GY3Ccf4NQipsVk96e3CShfwNW6Sxi3nkj7LTZRtiGqx4");

async function main() {
  // Sender's token account
  const senderATA = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey,
  );

  // Recipient's token account
  const recipientATA = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    recipient,
  );

  // Transfer 100 tokens
  const amount = 100n * 10n ** 9n;

  const signature = await transferChecked(
    connection,
    wallet,
    senderATA.address,
    mint,
    recipientATA.address,
    wallet,
    amount,
    9,
  );

  console.log("Transaction:", signature);

  // Verify balances
  const senderAccount = await getAccount(connection, senderATA.address);

  const recipientAccount = await getAccount(connection, recipientATA.address);

  const mintInfo = await getMint(connection, mint);

  console.log("Sender Balance:", Number(senderAccount.amount) / 1e9);

  console.log("Recipient Balance:", Number(recipientAccount.amount) / 1e9);

  console.log("Total Supply:", Number(mintInfo.supply) / 1e9);

  console.log(
    `Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  );
}

main().catch(console.error);

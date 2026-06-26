export const faqs = [
  {
    q: "What is SimplyVest?",
    a: "SimplyVest is a non-custodial token vesting protocol on Solana. It lets you lock SPL tokens in a program-owned vault and release them to a recipient on a schedule — either time-based (linear vesting) or milestone-gated (triggered by a third party).",
  },
  {
    q: "What's the difference between time-based and milestone vesting?",
    a: "Time-based vesting releases tokens continuously from start to end, with an optional cliff. Milestone vesting holds all tokens until a designated authority triggers the release — then the full amount becomes claimable.",
  },
  {
    q: "Is SimplyVest custodial?",
    a: "No. Tokens are held in a program-derived vault PDA. Only the Solana program can authorize transfers. Not even the creator can move tokens outside the vesting schedule. The creator can cancel, but vested tokens always go to the recipient.",
  },
  {
    q: "Can I cancel a stream?",
    a: "Yes. The creator can cancel a stream at any time. The recipient receives whatever has vested (including unclaimed vested tokens), and the unvested portion returns to the creator. Both accounts are then closed.",
  },
  {
    q: "What happens when a stream completes?",
    a: "When the recipient withdraws the last vested tokens, the stream and vault accounts are automatically closed. The rent-exempt SOL is returned to the creator.",
  },
  {
    q: "Does SimplyVest charge fees?",
    a: "No. SimplyVest charges zero protocol fees. You only pay standard Solana network transaction fees (typically less than $0.01 per transaction).",
  },
  {
    q: "What tokens can I use?",
    a: "Any SPL Token or Token-2022 mint is supported. Token-2022 mints with transfer-hook extensions are rejected at creation time to prevent silent failures during withdraw or cancel.",
  },
  {
    q: "Can I have multiple streams with the same person?",
    a: "Yes. The protocol uses a sequential nonce per creator, allowing unlimited streams between the same creator, recipient, and mint without address collisions.",
  },
  {
    q: "Is the code open source?",
    a: "Yes. SimplyVest is MIT licensed and fully auditable on GitHub. The program is written in Rust using the Anchor framework and deployed on Solana mainnet.",
  },
  {
    q: "When will SimplyVest launch?",
    a: "SimplyVest is in active development. Join the waitlist to be notified when we launch.",
  },
];

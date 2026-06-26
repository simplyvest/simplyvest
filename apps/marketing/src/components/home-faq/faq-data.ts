const faqs = [
  {
    q: "What is SimplyVest?",
    a: "SimplyVest is a non-custodial token vesting protocol on Solana. It lets you lock SPL tokens in a program-owned vault and release them to a recipient on a schedule — either time-based (linear vesting) or milestone-gated (triggered by a third party).",
  },
  {
    q: "What's the difference between time-based and milestone vesting?",
    a: "Time-based streams unlock tokens continuously from start to end, with an optional cliff before the first release. Milestone vesting holds all tokens until a designated authority triggers the release — then the full amount becomes claimable.",
  },
  {
    q: "Is SimplyVest custodial?",
    a: "No. SimplyVest is fully non-custodial. Tokens are held in a program-derived vault PDA. Only the Solana program can authorize transfers — not even the creator can move tokens outside the vesting schedule.",
  },
  {
    q: "Can I cancel a stream?",
    a: "Yes, stream creators can cancel at any time. The recipient keeps everything that has already vested, and the unvested portion returns to the creator. Both accounts are closed to recover rent.",
  },
  {
    q: "What happens when a stream completes?",
    a: "When a stream completes, the recipient withdraws the last vested tokens and the stream and vault accounts are automatically closed. The rent-exempt SOL is returned to the creator.",
  },
  {
    q: "Does SimplyVest charge fees?",
    a: "SimplyVest charges zero protocol fees. You only pay standard Solana network transaction fees, typically less than $0.01 per transaction.",
  },
  {
    q: "How do I get started?",
    a: "SimplyVest is currently in development. Join the waitlist to be notified when the beta launches, or read the documentation to learn how the protocol works under the hood.",
  },
];

export { faqs };

import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { SectionHeader } from "@/components/ui/section-header";
import { ConceptRow } from "@/components/ui/concept-row";
import { VestingCard } from "@/components/ui/vesting-card";
import { Callout } from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/docs",
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-28">
      <Badge variant="sol">Protocol v1</Badge>
      <h1 className="mt-4">
        DOCS<br />
        <em>OVERVIEW</em>
      </h1>
      <p className="max-w-[580px] text-lg leading-relaxed text-muted">
        SimplyVest is a non-custodial, on-chain SPL-token vesting and
        distribution protocol built with Anchor on Solana.
      </p>

      <SectionHeader
        num="01"
        title="Stream Types"
        sub="Two types of vesting streams for different distribution models."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <VestingCard
          color="#9945ff"
          label="Time-Based"
          title="StreamAccount"
          description="Linear vesting from start to end, with optional cliff. Tokens vest continuously based on elapsed time."
          examples={[
            "Team token grants with 1-year cliff",
            "Investor lockups",
            "Salary streaming",
          ]}
        />
        <VestingCard
          color="#14f195"
          label="Milestone"
          title="MilestoneStream"
          description="All-or-nothing release gated by a milestone authority. When triggered, the full amount is claimable."
          examples={[
            "Freelance payments on completion",
            "Grant disbursements",
            "Escrow for services",
          ]}
        />
      </div>

      <SectionHeader
        num="02"
        title="Account Model"
        sub="Four on-chain account types power the protocol."
      />

      <div className="mt-8 flex flex-col gap-4">
        <ConceptRow
          icon="📦"
          title="Stream Account"
          monoLabel="StreamAccount (PDA)"
          color="#9945ff"
        >
          <p className="text-[0.9rem] leading-relaxed text-muted">
            Stores stream metadata: creator, recipient, mint, vault, amount,
            amounts withdrawn, timestamps. Created at stream creation and closed
            on completion or cancellation.
          </p>
        </ConceptRow>
        <ConceptRow
          icon="🔐"
          title="Vault Account"
          monoLabel="Vault (PDA Token Account)"
          color="#14f195"
        >
          <p className="text-[0.9rem] leading-relaxed text-muted">
            A custom PDA token account holding the locked tokens. The stream PDA
            is the authority. Closed on completion or cancellation to return rent
            SOL to the creator.
          </p>
        </ConceptRow>
        <ConceptRow
          icon="📋"
          title="Creator Config"
          monoLabel="CreatorConfig (PDA)"
          color="#00c2ff"
        >
          <p className="text-[0.9rem] leading-relaxed text-muted">
            One per creator. Tracks a sequential nonce enabling multiple streams
            between the same creator, recipient, and mint without address
            collisions.
          </p>
        </ConceptRow>
      </div>

      <SectionHeader
        num="03"
        title="Security Model"
        sub="Key security properties of the protocol."
      />

      <div className="mt-8 flex flex-col gap-4">
        <Callout variant="default">
          <strong>PDA Vaults:</strong> Tokens are held in program-derived
          accounts. Only the program can authorize transfers via{" "}
          <code>invoke_signed</code>. Neither the creator nor recipient can move
          tokens outside the vesting schedule.
        </Callout>
        <Callout variant="green">
          <strong>Recipient Commitment:</strong> The recipient is encoded in the
          PDA seeds. Even if account data were corrupted, the address itself
          proves who the stream is for.
        </Callout>
        <Callout variant="blue">
          <strong>Rent Recovery:</strong> When a stream completes or is
          cancelled, the vault and stream accounts are closed and the rent-exempt
          SOL is returned to the creator.
        </Callout>
        <Callout variant="warn">
          <strong>Token-2022:</strong> If a mint has a transfer-hook extension,
          creation is rejected to prevent silent CPI failures during withdraw or
          cancel. Standard SPL Token and Token-2022 mints are supported.
        </Callout>
      </div>

      <div className="h-16" />
    </div>
  );
}

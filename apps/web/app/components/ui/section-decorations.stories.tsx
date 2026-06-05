import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { SectionDecorations, BlobBlob } from "./section-decorations";

const meta = {
  component: SectionDecorations,
  args: {
    children: (
      <>
        <BlobBlob className="-left-32 top-1/4 h-96 w-96 bg-purple-300/20" />
        <BlobBlob className="-bottom-40 right-0 h-80 w-80 bg-cyan-300/10" />
      </>
    ),
    className:
      "relative h-[400px] w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900",
  },
} satisfies Meta<typeof SectionDecorations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

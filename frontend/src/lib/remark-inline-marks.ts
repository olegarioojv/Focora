import { findAndReplace } from 'mdast-util-find-and-replace'
import type { PhrasingContent, Root, Text } from 'mdast'
import type { Plugin } from 'unified'

// mdast-to-hast falls back to `data.hName`/`hProperties` for any node type
// it doesn't otherwise recognize, so a plain object here is enough to reach
// the DOM as a real <mark>/<u> element without registering custom handlers.
// mdast-util-find-and-replace's types only know about the built-in phrasing
// nodes, so the cast is unavoidable for this (well-documented) pattern.
function makeReplacer(hName: 'mark' | 'u') {
  return (_match: string, value: string): PhrasingContent =>
    ({
      type: hName,
      data: { hName },
      children: [{ type: 'text', value } satisfies Text],
    }) as unknown as PhrasingContent
}

/** `==texto==` -> <mark>, `++texto++` -> <u>. Obsidian-style inline marks
 * layered on top of remark-gfm; not part of CommonMark/GFM. */
export const remarkInlineMarks: Plugin<[], Root> = () => (tree) => {
  findAndReplace(tree, [
    [/==([^=\n]+)==/g, makeReplacer('mark')],
    [/\+\+([^+\n]+)\+\+/g, makeReplacer('u')],
  ])
}

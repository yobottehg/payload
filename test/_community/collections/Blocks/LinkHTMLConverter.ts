import type {
  HTMLConverter,
  LinkFields,
  SerializedLinkNode} from '@payloadcms/richtext-lexical';
import type { PayloadRequest } from 'payload'

import {
  LinkNode,
  convertLexicalNodesToHTML
} from '@payloadcms/richtext-lexical'

export const getLinkHref = async (nodeFields: LinkFields, req: PayloadRequest | null) => {
  const { doc } = nodeFields

  const payloadArgs = {
    depth: 0,
    draft: false,
    req,
    showHiddenFields: false,
    id: doc?.value as string,
  }

  const result = await req.payload.findByID({
    ...payloadArgs,
    collection: 'posts',
  })

  return result.slug
}

export const LinkHTMLConverter: HTMLConverter<SerializedLinkNode> = {
  converter: async ({ converters, node, parent, req, showHiddenFields, overrideAccess, draft }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: {
        ...node,
        parent,
      },
      req,
      showHiddenFields,
      overrideAccess,
      draft,
    })

    // Calling payload.findByID causes an endless loop when two documents reference each other.
    const href = await getLinkHref(node.fields, req)

    return `<a href="${href}">${childrenText}</a>`
  },
  nodeTypes: [LinkNode.getType()],
}

export default LinkHTMLConverter

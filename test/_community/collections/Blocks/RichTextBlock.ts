import type { Block, FieldAffectingData } from 'payload'

import {
  HTMLConverterFeature,
  InlineToolbarFeature,
  LinkFeature,
  lexicalEditor,
  lexicalHTML,
} from '@payloadcms/richtext-lexical'

import { LinkHTMLConverter } from './LinkHTMLConverter'

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: {
    singular: 'Rich Text Block',
    plural: 'Rich Text Blocks',
  },
  fields: [
    {
      name: 'content',
      label: 'Rich Text',
      type: 'richText',
      editor: lexicalEditor({
        features: () => [
          LinkFeature({
            enabledCollections: ['posts'],
            fields: ({ defaultFields }: { defaultFields: FieldAffectingData[] }) => [
              ...defaultFields,
            ],
          }),
          HTMLConverterFeature({
            converters: ({ defaultConverters }) => [...defaultConverters, LinkHTMLConverter],
          }),
          InlineToolbarFeature(),
        ],
      }),
    },
    lexicalHTML('content', { name: 'content_html' }),
  ],
}

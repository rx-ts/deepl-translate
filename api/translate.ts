import { VercelRequest, VercelResponse } from '@vercel/node'
import type { SourceLanguage, TargetLanguage } from 'deeplx'

// Workaround for Vercel `Cannot find module 'deeplx'`
import { abbreviateLanguage, translate } from './_deeplx'

export interface RequestParams {
  text?: string
  source_lang?: SourceLanguage
  target_lang: TargetLanguage
}

const OK = 200
const NOT_ALLOWED = 405
const INTERNAL_ERROR = 500

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  // type-coverage:ignore-next-line
  const body = req.body as RequestParams | undefined

  if (!body || req.method !== 'POST') {
    res.end(`DeepL Translate Api

POST {"text": "have a try", "source_lang": "auto", "target_lang": "ZH"} to /translate

https://github.com/un-ts/deeplx`)
    return
  }

  res.setHeader('Content-Type', 'application/json')

  const { text, source_lang: sourceLang, target_lang: targetLang } = body

  if (!abbreviateLanguage(targetLang)) {
    res.status(NOT_ALLOWED)
    res.end(
      JSON.stringify({
        code: NOT_ALLOWED,
        data: 'Invalid target language',
      }),
    )
    return
  }

  try {
    const translation = await translate(text, targetLang, sourceLang)
    res.end(
      JSON.stringify({
        code: OK,
        data: translation,
      }),
    )
  } catch (err) {
    res.status(INTERNAL_ERROR)
    res.end(
      JSON.stringify({
        code: INTERNAL_ERROR,
        data: String(err),
      }),
    )
  }
}

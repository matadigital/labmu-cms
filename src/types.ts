import { D1Database, R2Bucket, KVNamespace } from '@cloudflare/workers-types'

export type Bindings = {
  DB: D1Database
  MY_BUCKET: R2Bucket
  QURAN_CACHE: KVNamespace // <--- Member Baru
}

export type Content = {
  id: number
  slug: string
  title: string
  body: string
  type: string
  status: string
  attributes?: string
}
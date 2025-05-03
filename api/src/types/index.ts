import { KVNamespace, SecretsStoreSecret } from "@cloudflare/workers-types";
import { Context as HonoContext } from "hono";

export type Bindings = {
  TEST_AUTH_KV: KVNamespace;
  TEST_SESSION_KV: KVNamespace;
  TEST_APPLICATION_KV: KVNamespace;
  TEST_ARCHIVE_KV: KVNamespace;
  TEST_ENCRYPTION_SECRET_KEY: SecretsStoreSecret;
  GOOGLE_CLIENT_ID: string;
};

export type Context = HonoContext<{
  Bindings: Bindings;
  Variables?: any;
  in?: any;
  out?: any;
}>;

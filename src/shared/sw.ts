import { clientsClaim } from "workbox-core";
import {
  addPlugins,
  cleanupOutdatedCaches,
  precacheAndRoute,
} from "workbox-precaching";
import { registerRoute, setDefaultHandler } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

self.__WB_DISABLE_DEV_LOGS = true;

const kCoiHeaders: [header: string, value: string][] = [
  ["Cross-Origin-Embedder-Policy", "require-corp"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
] as const;

class WorkboxCoiPlugin {
  async fetchDidSucceed({ response }: { response: Response }) {
    const { status, statusText, headers: oldHeaders } = response;
    const headers = new Headers(oldHeaders);
    kCoiHeaders.forEach(([header, value]) => {
      if (headers.get(header) !== value) headers.set(header, value);
    });
    return new Response(response.body, { status, statusText, headers });
  }
}

const kCoiPlugin = [new WorkboxCoiPlugin()];
const coiNetworkOnly = new NetworkOnly({ plugins: kCoiPlugin });
const manifest = self.__WB_MANIFEST;

cleanupOutdatedCaches();
addPlugins(kCoiPlugin);
precacheAndRoute(manifest);

/* Workbox routes work with HTTP GET only by default. */
registerRoute(/serverTime\.[0-9a-z]+$/, coiNetworkOnly, "HEAD");

setDefaultHandler(coiNetworkOnly);

self.skipWaiting();
clientsClaim();

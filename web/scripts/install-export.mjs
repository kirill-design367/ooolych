// The export contains only public storefront files. Keep the PHP API and admin alongside it.
import { cp, readdir } from "node:fs/promises";
const out = new URL("../out/", import.meta.url);
const target = new URL("../../public/", import.meta.url);
for (const name of await readdir(out)) {
  await cp(new URL(name, out), new URL(name, target), { recursive: true });
}

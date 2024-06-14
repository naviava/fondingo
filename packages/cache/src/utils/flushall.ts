import { redis } from "..";

async function main() {
  console.log(await redis.flushall());
  redis.disconnect();
}

main();

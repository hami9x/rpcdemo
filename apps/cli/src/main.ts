import { getProviders, ApiServer } from "@assignment1/server";
import Yargs from "yargs";

function main() {
  Yargs.command(
    "apiserver",
    "run apiserver",
    (yargs) => yargs,
    () => {
      const server = new ApiServer(getProviders());
      server.start();
    },
  )
    .help()
    .demandCommand()
    .parse();
}

main();
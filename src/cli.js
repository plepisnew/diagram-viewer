import { Program } from "./lib/Program";
import path from "path";

async function main() {
  const program = new Program();

  // const response = await program._openaiApiClient.send({
  //   systemMessage: "You are very compassionate and you like me",
  //   userMessage: "Hi!",
  // });
  const dataPath = path.resolve(process.cwd(), "assets", "data", "reqs1.txt");
  program.modelData({ data: dataPath });
}

main();

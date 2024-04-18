import { Program } from "./module/Program";
import path from "path";
import fs from "fs/promises";

async function main() {
  const program = new Program();

  const data = `The system can request textual guidelines for modeling requirement data (in the mermaid modeling language) from the Diagrams API.\nThe system accepts textual input, in the form of software requirements, from users, which is processed by the Prompt Module.\nThe system exposes the Prompt Module, which preprocesses user input by reformatting it, removing irrelevant information, and adding missing information if necessary. The Prompt Module has a dependency on the OpenAI ChatGPT API.\nThe system exposes the Serializer Module, which transforms diagram guidelines and data received from the Prompt Module into a textual model written in the mermaid modeling language. The Serializer Module has a dependency on the OpenAI ChatGPT API.\nThe system exposes the Visualizer Module, which renders models written in the mermaid modeling language as images (For example PNG). The Visualizer Module has a dependency on the Diagrams API.\nThe system exposes a simple web interface for modeling requirement data.`;

  const systemMessage = await fs.readFile(
    path.resolve(process.cwd(), "assets", "examples", "guidelines_response", "mermaid_graph_copy.txt"),
    { encoding: "utf-8" }
  );

  program.modelData({ data, systemMessageOverride: systemMessage });
}

main();

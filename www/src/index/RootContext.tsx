import axios from "axios";
import toast, { ToastOptions } from "react-hot-toast";

export class RootContext {
  static constants = {
    prefilledInput: [
      `The application must support user authentication mechanisms to allow users to create accounts, log in securely, and manage their profiles.`,
      `Spotify should provide seamless streaming of high-quality audio tracks to users over the internet, allowing for uninterrupted playback.`,
      `The application must include robust search functionality that enables users to find specific songs, artists, albums, playlists, and genres quickly. Additionally, it should offer personalized music recommendations and discovery features based on user preferences and listening history.`,
      `Users should be able to create, edit, delete, and organize playlists to curate their music collections according to their preferences and moods.`,
      `The application should allow users to download songs, albums, and playlists for offline playback, enabling them to listen to their favorite music even without an internet connection.`,
      `Spotify should be compatible with various operating systems and devices, including Windows, macOS, iOS, Android, and web browsers, ensuring a consistent user experience across different platforms.`,
      `The application should integrate social features that enable users to share music, playlists, and their listening activities with friends and followers on social media platforms.`,
      `Spotify should offer customizable user interfaces and settings to allow users to tailor their music listening experience according to their preferences, such as adjusting audio quality, playback controls, and theme options.`,
      `The application must support radio stations and podcasts, allowing users to discover and listen to live radio broadcasts and on-demand podcasts seamlessly.`,
      `Spotify should provide intuitive playback controls, including play, pause, skip, shuffle, and repeat functionalities, as well as the ability to manage the playback queue easily.`,
      `The application should integrate with users' existing music libraries and local files, allowing them to import and synchronize their own music collections with Spotify's cloud-based platform.`,
      `Spotify should prioritize accessibility features to ensure that the application is usable by individuals with disabilities. Additionally, it should support multiple languages and localized content to cater to users from diverse linguistic backgrounds.`,
    ].join("\n"),
    prefilledPrompt: [
      `Guidelines when creating the graph diagram in any diagram language:`,
      `- Avoid linear diagrams when possible, diagrams should be hierarchical and have multiple branches when applicable.`,
      `- Don't add the label if its the same as the destination node.`,
      ``,
      `Important rules when creating the graph diagram in mermaid syntax:`,
      `- Prefer using graph TB types of diagrams.`,
      `- Never use the ampersand (&) symbol in the diagram, it will break the diagram. Use the word "and" instead. For example use "User and Admin" instead of "User & Admin".`,
      `- Never use round brackets () in the node identifiers, node labels and edge labels, it will break the diagram. Use a coma instead. For example use "User, Admin" instead of "User (Admin).`,
      `- Don't use empty labels " for edges, instead don't label the edge at all. For example U["User"] --> A["Admin"].`,
      `- Avoid using semicolon as line separator, prefer using new-lines instead. For example use "graph LR\\n`,
      `A --> B" instead of "graph LR;  A --> B"`,
      `Rules when using graph diagrams in mermaid syntax:`,
      `- Use short node identifiers, for example U for User or FS for File System.`,
      `- Always use double quotes for node labels, for example U["User"].`,
      `- Never create edges that connect to only one node; each edge should always link two nodes together. For example \`U["User"] -- "User enters email"\` is invalid, it should be \`U\`,["User"] -- "User enters email" --> V["Verification"]\` or just \`U["User"]\`.`,
      `- Always use double quotes for edge labels, for example U["User"] -- "User enters email" --> V["Verification"].`,
      `- To break a line in a node label, use the <br /> tag, for example U["User<br />Admin"].`,
      `- Indentation is very important, always indent according to the examples below.`,
      `Rules when using graph diagrams with subgraphs in mermaid syntax:`,
      `Never refer to the subgraph root node from within the subgraph itself.`,
      `For example this is wrong subgraph usage:`,
      ``,
      `\`\`\``,
      `graph TB`,
      `  subgraph M["Microsoft"]`,
      `    A["Azure"]`,
      `    M -- "Invested in" --> O`,
      `  end`,
      `  `,
      `  subgraph O["AI"]`,
      `    C["Chat"]`,
      `  end`,
      `\`\`\``,
      ``,
      `In this diagram M is referenced from within the M subgraph, this will break the diagram.`,
      `Never reference the subgraph node identifier from within the subgraph itself.`,
      `Instead move any edges that connect the subgraph with other nodes or subgraphs outside of the subgraph like so.`,
      `Correct subgraph usage:`,
      `\`\`\``,
      `graph TB`,
      `  subgraph M["Microsoft"]`,
      `    A["Azure"]`,
      `  end`,
      `  M -- "Invested in" --> O`,
      `  `,
      `  subgraph O["OpenAI"]`,
      `    C["ChatGPT"]`,
      `  end`,
      `\`\`\``,
      `Examples:`,
      `User asks: "Show me how vscode internals work."`,
      `\`\`\``,
      `graph TB`,
      `  U["User"] -- "File Operations" --> FO["File Operations"]`,
      `  U -- "Code Editor" --> CE["Code Editor"]`,
      `  FO -- "Manipulation of Files" --> FS["FileSystem"]`,
      `  FS -- "Write/Read" --> D["Disk"]`,
      `  FS -- "Compress<br />Decompress" --> ZL["ZipLib"]`,
      `  FS -- "Read" --> IP["INIParser"]`,
      `  CE -- "Create<br />Display<br />Edit" --> WV["Webview"]`,
      `  CE -- "Language`,
      `  Code Analysis" --> VCA["VSCodeAPI"]`,
      `  VCA -- "Talks to" --> VE["ValidationEngine"]`,
      `  WV -- "Render UI" --> HC["HTMLCSS"]`,
      `  VE -- "Decorate Errors" --> ED["ErrorDecoration"]`,
      `  VE -- "Analyze Document" --> TD["TextDocument"]`,
      `\`\`\``,
      `User asks: "Draw me a mindmap for beer brewing. Maximum of 4 nodes"`,
      `\`\`\``,
      `graph TB`,
      `  B["Beer"]`,
      `  B --> T["Types"]`,
      `  B --> I["Ingredients"]`,
      `  B --> BP["Brewing Process"]`,
      `\`\`\``,
      `User asks:`,
      `"Computing backend data services is a distributed system made of multiple microservices.`,
      `A web browser sends an HTTP api request to the load balancer.`,
      `The load balancer sends the http request to the crossover service.`,
      `Crossover talks to redis and mysql database.`,
      `Crossover makes a downstream API request to multiplex to submit the query which returns a job id to crossover.`,
      `Then crossover makes a long poll API request to evaluator to get the results of the job.`,
      `Then evaluator makes an API call to multiplex to check the status of the job.`,
      `Once evaluator gets a successful status response from multiplex, then evaluator makes a third API call to result-fetcher service to download the job results from S3 or GCP cloud buckets.`,
      `The result is streamed back through evaluator to crossover.`,
      `Crossover post processes the result and returns the API response to the client.`,
      `Draw me a diagram of this system"`,
      `\`\`\``,
      `graph TB`,
      `  A["Web Browser"] -- "HTTP API Request" --> B["Load Balancer"]`,
      `  B -- "HTTP Request" --> C["Crossover"]`,
      `  C -- "Talks to" --> D["Redis"]`,
      `  C -- "Talks to" --> E["MySQL"]`,
      `  C -- "Downstream API Request" --> F["Multiplex"]`,
      `  F -- "Returns Job ID" --> C`,
      `  C -- "Long Poll API Request" --> G["Evaluator"]`,
      `  G -- "API Call" --> F`,
      `  G -- "API Call" --> H["Result-Fetcher"]`,
      `  H -- "Downloads Results" --> I["S3 or GCP Cloud Buckets"]`,
      `  I -- "Results Stream" --> G`,
      `  G -- "Results Stream" --> C`,
      `  C -- "API Response" --> A`,
      `\`\`\``,
      `Sometimes you will need to revise the same diagram based on user feedback.`,
      `For the last example the user might make a followup request:`,
      `User followup ask:`,
      `"Crossover post processes the result and returns the API response to the client through the load balancer.`,
      `Draw the crossover node in green"`,
      `\`\`\``,
      `query: "graph TB`,
      `  A["Web Browser"] -- "HTTP API Request" --> B["Load Balancer"]`,
      `  B -- "HTTP Request" --> C["Crossover"]`,
      `  style C fill:#99cc99`,
      `  C -- "Talks to" --> D["Redis"]`,
      `  C -- "Talks to" --> E["MySQL"]`,
      `  C -- "Downstream API Request" --> F["Multiplex"]`,
      `  F -- "Returns Job ID" --> C`,
      `  C -- "Long Poll API Request" --> G["Evaluator"]`,
      `  G -- "API Call" --> F`,
      `  G -- "API Call" --> H["Result-Fetcher"]`,
      `  H -- "Downloads Results" --> I["S3 or GCP Cloud Buckets"]`,
      `  I -- "Results Stream" --> G`,
      `  G -- "Results Stream" --> C`,
      `  C -- "API Response" --> B`,
      `  B -- "API Response" --> A`,
      `\`\`\``,
    ].join("\n"),
    pollInterval: 1000,
  };

  static modules = {
    apiClient: (() => {
      let _intervalId: NodeJS.Timeout;

      const httpClient = axios.create({
        baseURL: import.meta.env.DEV ? "http://localhost:5000" : "/",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const poll = async (requestId: string): Promise<boolean | { diagramUrl: string; model: string }> => {
        try {
          const { data } = await httpClient.post("/model/async", { requestId });

          if ("message" in data) {
            return true;
          }

          return data;
        } catch (err) {
          return false;
        }
      };
      return {
        requestModel: async (
          request: { data: string; systemMessage?: string },
          onResolve: (resolveOptions: { diagramUrl: string; model: string }) => void,
          onReject: () => void
        ): Promise<{ requestId: string }> => {
          const {
            data: { requestId },
          } = await httpClient.post("/model/async", {
            diagramType: "graph",
            data: request.data,
            systemMessageOverride: request.systemMessage,
          });

          _intervalId = setInterval(async () => {
            const result = await poll(requestId);

            console.log({ result });
            if (result === true) {
              return;
            }

            clearInterval(_intervalId);
            result ? onResolve(result) : onReject();
          }, RootContext.constants.pollInterval);

          return { requestId };
        },
      };
    })(),
  };

  static procedures = {
    triggerToast: (handler: (typeof toast)["custom"], text: string, options?: ToastOptions) => {
      const toastId = handler(({ id }) => <div onClick={() => toast.dismiss(id)}>{text}</div>, options);

      return toastId;
    },
  };
}

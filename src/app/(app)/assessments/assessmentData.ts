export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  skillTested: string;
  explanation: string;
}

export interface AssessmentTrack {
  id: string;
  title: string;
  category: string;
  primarySkill: string;
  durationMinutes: number;
  description: string;
  questions: Question[];
}

export const ASSESSMENT_TRACKS: AssessmentTrack[] = [
  {
    id: "fullstack",
    title: "Full Stack Web & Distributed Systems",
    category: "Technical",
    primarySkill: "Full Stack Development",
    durationMinutes: 5,
    description: "Evaluates React, Server Actions, REST/GraphQL APIs, and SQL query optimization.",
    questions: [
      {
        id: "fs-1",
        text: "In a modern Next.js App Router application, what is the key architectural difference between a React Server Component (RSC) and a Client Component?",
        options: [
          "RSCs render only on the client, whereas Client Components render only on the build server",
          "RSCs execute exclusively on the server with zero client bundle size impact, whereas Client Components allow interactivity via the browser DOM",
          "RSCs can use useState and useEffect hooks directly, while Client Components cannot",
          "There is no difference; they are synonymous aliases in Next.js 15"
        ],
        correctIndex: 1,
        skillTested: "Next.js & React",
        explanation: "React Server Components execute exclusively on the server and send pre-rendered payload to the client without including their implementation code in the JavaScript bundle."
      },
      {
        id: "fs-2",
        text: "When optimizing a relational database query in PostgreSQL with a large volume of reads on 'user_id', which indexing strategy provides optimal lookup performance?",
        options: [
          "Creating a B-Tree index on the foreign key user_id column",
          "Performing a full sequential table scan with parallel workers",
          "Storing the user_id in an unindexed JSONB blob",
          "Disabling foreign key constraints entirely"
        ],
        correctIndex: 0,
        skillTested: "SQL & PostgreSQL",
        explanation: "B-Tree indexes are standard for equality and range queries on foreign key columns, drastically reducing lookup time from O(N) to O(log N)."
      },
      {
        id: "fs-3",
        text: "How does Node.js achieve non-blocking asynchronous I/O despite executing on a single main JavaScript thread?",
        options: [
          "By spawning a new operating system process for every incoming HTTP request",
          "By utilizing the Libuv event loop and a thread pool for asynchronous system operations",
          "By using synchronous sleep intervals between CPU operations",
          "By compiling JavaScript directly to hardware FPGA registers"
        ],
        correctIndex: 1,
        skillTested: "Node.js Architecture",
        explanation: "Libuv provides Node.js with an event-driven event loop and a background worker thread pool to handle file/network I/O without blocking the main thread."
      },
      {
        id: "fs-4",
        text: "Which HTTP header and method combination is the most idempotent and secure for updating only a subset of fields on an existing resource?",
        options: [
          "POST with Cache-Control: max-age=0",
          "PATCH with appropriate Content-Type and authorization headers",
          "DELETE with a query parameter",
          "GET with an authorization bearer token"
        ],
        correctIndex: 1,
        skillTested: "REST APIs & Web Standards",
        explanation: "PATCH is specifically standardized for partial modifications to an existing resource, unlike PUT which replaces the entire entity."
      },
      {
        id: "fs-5",
        text: "What is the primary benefit of using TypeScript over vanilla JavaScript in production engineering teams?",
        options: [
          "TypeScript executes 10x faster in browser V8 engines without JIT compilation",
          "Compile-time static type safety and contract verification that prevent runtime type errors",
          "TypeScript eliminates the need for unit testing and CI/CD pipelines",
          "TypeScript files run directly on bare-metal servers without Node.js"
        ],
        correctIndex: 1,
        skillTested: "TypeScript & Code Quality",
        explanation: "TypeScript introduces compile-time type verification, catching defects before runtime and facilitating safe refactoring in team codebases."
      }
    ]
  },
  {
    id: "cloud-devops",
    title: "Cloud Architecture & DevOps",
    category: "Cloud",
    primarySkill: "Cloud & DevOps",
    durationMinutes: 5,
    description: "Evaluates Docker containerization, Kubernetes orchestration, CI/CD, and AWS architecture.",
    questions: [
      {
        id: "cd-1",
        text: "What is the primary role of a multi-stage Docker build in production application deployment?",
        options: [
          "To run multiple containers on the exact same port simultaneously",
          "To separate the build environment (compilers, devDependencies) from the lean runtime image, minimizing artifact size and vulnerability surface",
          "To replicate Docker images across multiple AWS regions automatically",
          "To encrypt the host Linux kernel"
        ],
        correctIndex: 1,
        skillTested: "Docker & Containerization",
        explanation: "Multi-stage builds allow you to use large build tools during intermediate phases and copy only the compiled binaries/artifacts into a minimal production image."
      },
      {
        id: "cd-2",
        text: "In a Kubernetes cluster, what is the purpose of a Horizontal Pod Autoscaler (HPA)?",
        options: [
          "To automatically scale the number of Pod replicas based on observed CPU/memory utilization or custom metrics",
          "To physically replace malfunctioning hard drives in the node pool",
          "To convert HTTP requests into gRPC protocol streams",
          "To reboot the master control plane every 24 hours"
        ],
        correctIndex: 0,
        skillTested: "Kubernetes Orchestration",
        explanation: "The Horizontal Pod Autoscaler automatically scales workloads up or down to meet fluctuating demand based on observed telemetry."
      },
      {
        id: "cd-3",
        text: "Which AWS service is designed for serverless, event-driven compute execution without provisioning or managing virtual machines?",
        options: [
          "Amazon EC2 Dedicated Hosts",
          "AWS Lambda",
          "Amazon EBS Cold HDD",
          "AWS Direct Connect"
        ],
        correctIndex: 1,
        skillTested: "AWS Cloud Infrastructure",
        explanation: "AWS Lambda is a serverless compute service that runs your code in response to events and automatically manages the underlying compute resources."
      },
      {
        id: "cd-4",
        text: "In continuous delivery (CI/CD), what is a 'Canary Deployment' strategy?",
        options: [
          "Deploying the update to a small subset of users/traffic to detect regressions before rolling it out to 100% of the fleet",
          "Deleting the production database and restoring from yesterday's backup",
          "Shutting down the entire cluster for 2 hours during scheduled maintenance",
          "Running tests exclusively on developer laptops before merging"
        ],
        correctIndex: 0,
        skillTested: "CI/CD & Release Engineering",
        explanation: "Canary deployments expose new code to a small, controlled slice of real traffic to monitor metrics before full rollout."
      },
      {
        id: "cd-5",
        text: "What principle does Infrastructure as Code (IaC) like Terraform enforce?",
        options: [
          "Manually clicking buttons in the AWS web console to configure servers",
          "Declarative, version-controlled definition and provisioning of cloud infrastructure",
          "Hardcoding database root credentials inside GitHub README files",
          "Disabling automated backups to save storage cost"
        ],
        correctIndex: 1,
        skillTested: "Infrastructure as Code",
        explanation: "IaC treats infrastructure configurations as code, enabling automated version control, audit trails, and reproducible environments."
      }
    ]
  },
  {
    id: "softskills",
    title: "Industry Professionalism & Problem Solving",
    category: "Soft Skills",
    primarySkill: "Industry Readiness & Problem Solving",
    durationMinutes: 5,
    description: "Evaluates agile collaboration, stakeholder communication, conflict resolution, and trade-off analysis.",
    questions: [
      {
        id: "ss-1",
        text: "You discover an unexpected edge-case bug 24 hours before a major product release deadline. What is the most professional initial response?",
        options: [
          "Silently ignore it and hope no customer triggers the edge case",
          "Document the bug, assess severity & blast radius, and immediately alert your engineering lead with viable mitigation options",
          "Blame the junior engineer who committed the code last week",
          "Cancel the entire product launch without informing stakeholders"
        ],
        correctIndex: 1,
        skillTested: "Accountability & Crisis Management",
        explanation: "Transparent communication with impact assessment and proposed solutions is the hallmark of senior engineering professionalism."
      },
      {
        id: "ss-2",
        text: "In an Agile Scrum framework, what is the core objective of the Sprint Retrospective meeting?",
        options: [
          "To assign blame to underperforming team members",
          "To inspect how the last sprint went with regards to individuals, interactions, processes, and tools, and identify continuous improvements",
          "To rewrite the entire product roadmap from scratch",
          "To conduct annual performance appraisals"
        ],
        correctIndex: 1,
        skillTested: "Agile Teamwork & Continuous Improvement",
        explanation: "The retrospective focuses on team growth, identifying what worked, what didn't, and how to improve collaborative velocity in the next cycle."
      },
      {
        id: "ss-3",
        text: "When presenting a complex technical architecture proposal to business stakeholders who lack deep engineering backgrounds, what is the best strategy?",
        options: [
          "Use as much low-level compiler jargon as possible to impress them",
          "Translate technical constraints into business outcomes, risk mitigation, and user value using clear analogies and visual diagrams",
          "Refuse to explain and ask them to trust you unconditionally",
          "Provide only raw assembly bytecode snippets"
        ],
        correctIndex: 1,
        skillTested: "Stakeholder Communication",
        explanation: "Effective engineering leaders bridge technical reality with business objectives, framing choices around reliability, cost, and user experience."
      },
      {
        id: "ss-4",
        text: "A teammate vehemently disagrees with your proposed technical approach during an architectural review. How should you proceed?",
        options: [
          "Listen to understand their concerns, evaluate trade-offs objectively using data/benchmarks, and seek consensus aligned with project goals",
          "Engage in an emotional argument and report them to HR immediately",
          "Subtly merge your code anyway late at night",
          "Concede immediately without assessing whether their critique is valid"
        ],
        correctIndex: 0,
        skillTested: "Collaborative Conflict Resolution",
        explanation: "Constructive architectural debate grounded in objective trade-offs and mutual respect produces superior software design."
      },
      {
        id: "ss-5",
        text: "What does the engineering principle 'Premature Optimization is the root of all evil' emphasize?",
        options: [
          "Never write fast code under any circumstances",
          "Focus first on clean, correct, and maintainable architecture, and optimize hotspots based on real profiling data rather than speculative guesses",
          "Always buy the most expensive cloud servers available",
          "Avoid caching database queries forever"
        ],
        correctIndex: 1,
        skillTested: "Engineering Trade-offs & Critical Thinking",
        explanation: "Knuth's famous aphorism cautions against complicating architectures to optimize theoretical bottlenecks before measuring real system behavior."
      }
    ]
  },
  {
    id: "aptitude",
    title: "Aptitude & Logical Reasoning",
    category: "Reasoning",
    primarySkill: "Aptitude & Logical Reasoning",
    durationMinutes: 5,
    description: "Evaluates numerical reasoning, logical deduction, and pattern recognition expected in placement drives.",
    questions: [
      {
        id: "apt-1",
        text: "If a company's revenue grows by 20% in the first year and 25% in the second year, what is the total percentage growth over the two years?",
        options: [
          "45%",
          "50%",
          "55%",
          "40%"
        ],
        correctIndex: 1,
        skillTested: "Numerical Reasoning",
        explanation: "100 -> 120 (after 20% growth). 120 * 1.25 = 150. The total growth is 50%."
      },
      {
        id: "apt-2",
        text: "In a certain code, 'DEVELOPER' is written as 'EFWFMPQFS'. How is 'TESTING' written in that code?",
        options: [
          "UFTUJOH",
          "UFTUHOI",
          "UFTUJNO",
          "UFUTJOH"
        ],
        correctIndex: 0,
        skillTested: "Pattern Recognition",
        explanation: "Each letter is shifted forward by one in the alphabet (D->E, E->F, etc.). Testing becomes UFTUJOH."
      },
      {
        id: "apt-3",
        text: "All engineers are analytical. Some analytical people are musicians. Therefore, some engineers must be musicians. Is this conclusion logically valid?",
        options: [
          "Yes",
          "No",
          "Only if musicians are engineers",
          "Depends on the context"
        ],
        correctIndex: 1,
        skillTested: "Logical Deduction",
        explanation: "The conclusion is invalid. Just because engineers are part of the 'analytical' group, and some of the 'analytical' group are musicians, it doesn't guarantee the two subsets overlap."
      }
    ]
  }
];

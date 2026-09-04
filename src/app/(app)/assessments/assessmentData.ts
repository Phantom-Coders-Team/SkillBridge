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
      },
      {
        id: "apt-4",
        text: "A bag contains 4 red balls, 5 blue balls, and 3 green balls. If two balls are drawn at random without replacement, what is the probability that both are blue?",
        options: [
          "5/33",
          "25/144",
          "5/22",
          "1/6"
        ],
        correctIndex: 0,
        skillTested: "Probability & Combinatorics",
        explanation: "P(1st blue) = 5/12. P(2nd blue | 1st blue) = 4/11. Total probability = (5/12) * (4/11) = 20/132 = 5/33."
      },
      {
        id: "apt-5",
        text: "Five teammates (A, B, C, D, E) sit in a row facing the podium. B sits between A and C. D is to the immediate right of C. E is at the far left end next to A. Who is sitting in the exact middle?",
        options: [
          "B",
          "A",
          "C",
          "D"
        ],
        correctIndex: 0,
        skillTested: "Spatial & Sequence Reasoning",
        explanation: "The left-to-right order is E, A, B, C, D. The teammate in the exact middle position (3rd of 5) is B."
      }
    ]
  },
  {
    id: "aiml",
    title: "AI, Machine Learning & Data Science",
    category: "Technical",
    primarySkill: "Artificial Intelligence & ML",
    durationMinutes: 5,
    description: "Evaluates model architectures, loss formulations, overfitting mitigation, transformers, and data preprocessing.",
    questions: [
      {
        id: "ai-1",
        text: "When training a deep neural network on an imbalanced classification dataset (e.g. 99% negative, 1% positive), which evaluation metric is LEAST informative?",
        options: [
          "Overall Classification Accuracy",
          "Area Under the Precision-Recall Curve (PR-AUC)",
          "F1-Score",
          "Balanced Accuracy"
        ],
        correctIndex: 0,
        skillTested: "Model Evaluation & Metrics",
        explanation: "A naive model predicting 'negative' 100% of the time achieves 99% accuracy on this dataset while failing to detect any positive instances."
      },
      {
        id: "ai-2",
        text: "What is the primary role of Dropout in training deep artificial neural networks?",
        options: [
          "To speed up matrix multiplication by pruning dead neurons permanently",
          "To act as a regularization technique by randomly zeroing activations during training, preventing co-adaptation of feature detectors",
          "To guarantee convergence to the global minimum of non-convex loss functions",
          "To convert continuous float values into quantized 8-bit integers"
        ],
        correctIndex: 1,
        skillTested: "Regularization & Generalization",
        explanation: "Dropout randomly deactivates a subset of neurons at each training iteration, forcing the network to learn robust, redundant representations and mitigating overfitting."
      },
      {
        id: "ai-3",
        text: "In the Transformer architecture, what is the computational complexity of the standard scaled dot-product self-attention mechanism with respect to sequence length N?",
        options: [
          "O(N)",
          "O(N log N)",
          "O(N^2)",
          "O(1)"
        ],
        correctIndex: 2,
        skillTested: "Transformer & LLM Architecture",
        explanation: "Calculating attention weights requires multiplying the N x d Query matrix with the d x N Key matrix, resulting in an N x N attention matrix with O(N^2) complexity."
      },
      {
        id: "ai-4",
        text: "Which loss function is mathematically standard when training a multi-class classification neural network using Softmax output activations?",
        options: [
          "Categorical Cross-Entropy Loss (Log Loss)",
          "Mean Squared Error (MSE)",
          "Hinge Loss",
          "Mean Absolute Error (L1 Loss)"
        ],
        correctIndex: 0,
        skillTested: "Optimization & Loss Formulations",
        explanation: "Categorical Cross-Entropy measures the distance between the predicted probability distribution and the true one-hot distribution, yielding steep gradients for misclassified examples."
      },
      {
        id: "ai-5",
        text: "What phenomenon occurs when a model deployed in production experiences a change in the statistical distribution of input features over time, degrading prediction accuracy?",
        options: [
          "Data Drift (or Covariate Shift)",
          "Cold Start Problem",
          "Vanishing Gradient",
          "Dead ReLU"
        ],
        correctIndex: 0,
        skillTested: "MLOps & Model Monitoring",
        explanation: "Data drift occurs when real-world production inputs diverge from the statistical characteristics of the training dataset, requiring automated telemetry and retraining triggers."
      }
    ]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & System Defense",
    category: "Security",
    primarySkill: "Cybersecurity & Threat Defense",
    durationMinutes: 5,
    description: "Evaluates zero-trust architecture, OWASP vulnerabilities, cryptography, and secure API implementation.",
    questions: [
      {
        id: "sec-1",
        text: "What is the most effective defense against SQL Injection vulnerabilities in modern web applications?",
        options: [
          "Client-side regular expression filtering in JavaScript",
          "Using Parameterized Queries (Prepared Statements) or Object-Relational Mappers (ORMs)",
          "Encrypting the backend database hard drive",
          "Restricting web traffic to HTTPS only"
        ],
        correctIndex: 1,
        skillTested: "AppSec & Injection Mitigation",
        explanation: "Parameterized queries separate SQL code from user-supplied data, ensuring input parameters are treated strictly as literals rather than executable SQL syntax."
      },
      {
        id: "sec-2",
        text: "What foundational principle defines the 'Zero Trust' security architecture model?",
        options: [
          "Never trust, always verify: assume breach and strictly authenticate/authorize every access request regardless of origin",
          "Trust any connection that originates from within the internal corporate LAN or VPN",
          "Disable all encryption protocols to allow deep packet inspection",
          "Rely entirely on static perimeter firewalls to protect all subnets"
        ],
        correctIndex: 0,
        skillTested: "Zero Trust Architecture",
        explanation: "Zero Trust assumes threats exist both inside and outside network boundaries; every request must be authenticated, authorized, and encrypted before granting access."
      },
      {
        id: "sec-3",
        text: "In asymmetric public key cryptography, how is a sender's digital signature generated and verified?",
        options: [
          "Generated with sender's public key; verified with recipient's private key",
          "Generated with sender's private key; verified with sender's public key",
          "Generated with a shared symmetric AES secret key",
          "Generated by hashing the message with MD5 without keys"
        ],
        correctIndex: 1,
        skillTested: "Cryptography & PKI",
        explanation: "The signer signs (encrypts hash) using their private key, which only they hold; anyone holding their public key can verify the signature and ensure authenticity."
      },
      {
        id: "sec-4",
        text: "Which HTTP response header is crucial to prevent Cross-Site Scripting (XSS) by restricting the domains from which scripts and assets can load?",
        options: [
          "Content-Security-Policy (CSP)",
          "Access-Control-Allow-Origin",
          "X-Frame-Options",
          "Strict-Transport-Security"
        ],
        correctIndex: 0,
        skillTested: "Web Security Headers & XSS",
        explanation: "Content-Security-Policy restricts executable script sources, disables unauthorized inline scripts, and stops untrusted third-party script injection."
      },
      {
        id: "sec-5",
        text: "Why should passwords NEVER be stored using fast hashing algorithms like MD5 or SHA-256?",
        options: [
          "Because they require too much RAM to compute",
          "Because GPUs can compute billions of hashes per second, making offline brute-force and dictionary attacks trivial; slow, salted KDFs like Argon2 or bcrypt must be used",
          "Because SHA-256 is proprietary commercial software",
          "Because MD5 cannot hash strings longer than 8 characters"
        ],
        correctIndex: 1,
        skillTested: "Authentication & Credential Security",
        explanation: "Modern hardware can compute billions of SHA-256 hashes per second. Adaptive, memory-hard key derivation functions like bcrypt and Argon2 with random salting defend against brute force."
      }
    ]
  }
];

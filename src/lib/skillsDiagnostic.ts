export interface DiagnosticQuestion {
  id: string;
  skillName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface ClientDiagnosticQuestion {
  id: string;
  skillName: string;
  question: string;
  options: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface DiagnosticSkillResult {
  skillName: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // 0 to 100
  passed: boolean; // score >= 70
  previousScore?: number;
}

export interface DiagnosticSubmissionResult {
  overallScore: number;
  skills: DiagnosticSkillResult[];
  review: {
    questionId: string;
    skillName: string;
    question: string;
    options: string[];
    userSelected: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }[];
  message: string;
}

// Curated question bank for key technical skills
export const SKILL_QUESTION_BANK: Record<string, DiagnosticQuestion[]> = {
  JavaScript: [
    {
      id: "js-1",
      skillName: "JavaScript",
      question: "What is the output of `typeof null` in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      correctIndex: 2,
      explanation: "In JavaScript, `typeof null` returns 'object'. This is a well-known legacy behavior from the original implementation.",
      difficulty: "beginner",
    },
    {
      id: "js-2",
      skillName: "JavaScript",
      question: "Which of the following creates a microtask in the JavaScript event loop?",
      options: ["setTimeout(fn, 0)", "Promise.resolve().then(fn)", "setInterval(fn, 10)", "requestAnimationFrame(fn)"],
      correctIndex: 1,
      explanation: "Promise callbacks and `queueMicrotask` queue microtasks, which execute before the next event loop tick and macrotasks.",
      difficulty: "intermediate",
    },
    {
      id: "js-3",
      skillName: "JavaScript",
      question: "How does JavaScript's prototypal inheritance resolve an inaccessible property on an object?",
      options: [
        "Throws a ReferenceError immediately",
        "Traverses up the `[[Prototype]]` chain until found or reaching `null`",
        "Falls back to the global `window` object properties",
        "Creates a placeholder undefined property on the object",
      ],
      correctIndex: 1,
      explanation: "JavaScript walks up the prototype chain via `[[Prototype]]` until either the property is found or `null` is reached (returning `undefined`).",
      difficulty: "intermediate",
    },
    {
      id: "js-4",
      skillName: "JavaScript",
      question: "What is a closure in JavaScript?",
      options: [
        "A function bundled together with references to its lexical environment",
        "A method to close unused network sockets in NodeJS",
        "A syntax to make all object properties immutable",
        "A lifecycle event hook executed right before garbage collection",
      ],
      correctIndex: 0,
      explanation: "A closure gives a function access to its outer scope from an inner function, preserved even after the outer function has finished executing.",
      difficulty: "beginner",
    },
    {
      id: "js-5",
      skillName: "JavaScript",
      question: "What does `Array.prototype.reduce` do if no initial value is provided for an empty array?",
      options: [
        "Returns undefined",
        "Returns null",
        "Throws a TypeError",
        "Returns an empty array",
      ],
      correctIndex: 2,
      explanation: "Calling `reduce()` on an empty array without an initial value throws a `TypeError: Reduce of empty array with no initial value`.",
      difficulty: "advanced",
    },
  ],

  TypeScript: [
    {
      id: "ts-1",
      skillName: "TypeScript",
      question: "What is the key difference between the `unknown` and `any` types in TypeScript?",
      options: [
        "`any` is type-safe whereas `unknown` disables all checks",
        "`unknown` requires type narrowing or casting before performing operations, whereas `any` does not",
        "`unknown` can only hold primitive values, while `any` holds objects",
        "There is no difference; they are exact aliases",
      ],
      correctIndex: 1,
      explanation: "`unknown` is the type-safe counterpart of `any`. Anything is assignable to `unknown`, but operations on it require narrowing or assertion.",
      difficulty: "intermediate",
    },
    {
      id: "ts-2",
      skillName: "TypeScript",
      question: "Which TypeScript utility type constructs a type with all properties of `T` set to optional?",
      options: ["Partial<T>", "Required<T>", "Readonly<T>", "Record<T, any>"],
      correctIndex: 0,
      explanation: "`Partial<T>` marks all properties of type `T` as optional.",
      difficulty: "beginner",
    },
    {
      id: "ts-3",
      skillName: "TypeScript",
      question: "How do you define a type guard function in TypeScript?",
      options: [
        "function isString(val: any): val is string",
        "function isString(val: any): boolean as string",
        "function isString(val: any) => type string",
        "function isString(val: any): typeof val == 'string'",
      ],
      correctIndex: 0,
      explanation: "User-defined type guards use the type predicate syntax `parameterName is Type` as the return type.",
      difficulty: "intermediate",
    },
    {
      id: "ts-4",
      skillName: "TypeScript",
      question: "What does the `never` type represent in TypeScript?",
      options: [
        "Values that can be null or undefined",
        "The return type of a function that returns void",
        "The type of values that never occur, such as a function that always throws",
        "Any type that hasn't been imported yet",
      ],
      correctIndex: 2,
      explanation: "`never` is the bottom type in TypeScript, representing values that can never occur (e.g. infinite loops or functions that always throw).",
      difficulty: "intermediate",
    },
  ],

  Python: [
    {
      id: "py-1",
      skillName: "Python",
      question: "Which data structure in Python is mutable and maintains insertion order (Python 3.7+)?",
      options: ["tuple", "dict", "frozenset", "int"],
      correctIndex: 1,
      explanation: "In Python 3.7+, standard dictionaries (`dict`) are guaranteed to maintain insertion order and are mutable.",
      difficulty: "beginner",
    },
    {
      id: "py-2",
      skillName: "Python",
      question: "What is the purpose of Python's GIL (Global Interpreter Lock)?",
      options: [
        "To speed up multiprocessing performance across cores",
        "To ensure thread safety in CPython by allowing only one native thread to execute Python bytecode at a time",
        "To encrypt memory allocated to variables",
        "To prevent infinite recursion in generator functions",
      ],
      correctIndex: 1,
      explanation: "The GIL is a mutex in CPython that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously.",
      difficulty: "intermediate",
    },
    {
      id: "py-3",
      skillName: "Python",
      question: "What does the `@property` decorator in a Python class do?",
      options: [
        "Makes an attribute accessible only to subclasses",
        "Allows a method to be accessed like an attribute (getter)",
        "Serializes the method into JSON",
        "Marks the method as static",
      ],
      correctIndex: 1,
      explanation: "The `@property` decorator allows a method to be accessed as an attribute, defining a getter and optionally setter/deleter.",
      difficulty: "intermediate",
    },
    {
      id: "py-4",
      skillName: "Python",
      question: "What is the difference between `list.append(x)` and `list.extend(x)` when `x = [1, 2]`?",
      options: [
        "`append` adds `[1, 2]` as a single element; `extend` iterates over `x` adding `1` and `2` individually",
        "`extend` adds `[1, 2]` as a single element; `append` iterates over `x`",
        "Both functions produce identical lists",
        "`extend` can only be used with tuples, while `append` only with lists",
      ],
      correctIndex: 0,
      explanation: "`append` adds its argument as a single element, whereas `extend` iterates over its argument appending each element.",
      difficulty: "beginner",
    },
  ],

  React: [
    {
      id: "react-1",
      skillName: "React",
      question: "When does the cleanup function of a `useEffect` hook run?",
      options: [
        "Only when the browser window is closed",
        "Before the component unmounts and before re-running the effect on subsequent renders",
        "Immediately after the effect callback executes",
        "Never, React automatically cleans up memory without running it",
      ],
      correctIndex: 1,
      explanation: "React executes the cleanup function returned by `useEffect` before the component unmounts and before re-running the effect on dependency change.",
      difficulty: "intermediate",
    },
    {
      id: "react-2",
      skillName: "React",
      question: "Why should `key` props in React lists NOT be random values (e.g. `Math.random()`)?",
      options: [
        "React will throw a compile-time syntax error",
        "It forces React to unmount and re-mount DOM nodes on every render, destroying internal component state and hurting performance",
        "It causes an infinite loop in `useState`",
        "Keys must be consecutive integers starting at 0",
      ],
      correctIndex: 1,
      explanation: "Using unstable keys causes elements to be recreated rather than reconciled, losing component state and degrading performance.",
      difficulty: "intermediate",
    },
    {
      id: "react-3",
      skillName: "React",
      question: "What is the main purpose of `useCallback` in React?",
      options: [
        "To memoize a callback function instance across re-renders to prevent unnecessary child re-renders",
        "To execute an asynchronous API request automatically",
        "To create a global Redux store dispatch handler",
        "To delay state updates until user idle",
      ],
      correctIndex: 0,
      explanation: "`useCallback` caches a function definition between renders so child components that rely on referential equality do not re-render unnecessarily.",
      difficulty: "intermediate",
    },
    {
      id: "react-4",
      skillName: "React",
      question: "What does React's Virtual DOM provide?",
      options: [
        "Direct hardware acceleration for GPU rendering",
        "An in-memory representation of real DOM nodes used to compute minimal updates (diffing/reconciliation)",
        "A replacement for HTML and CSS in the browser",
        "A sandboxed environment that blocks JavaScript injections",
      ],
      correctIndex: 1,
      explanation: "The Virtual DOM is an in-memory representation of UI elements that React uses to diff and compute optimal real DOM manipulations.",
      difficulty: "beginner",
    },
  ],

  SQL: [
    {
      id: "sql-1",
      skillName: "SQL",
      question: "What is the difference between `WHERE` and `HAVING` in SQL?",
      options: [
        "`WHERE` filters rows before grouping; `HAVING` filters groups after `GROUP BY` aggregation",
        "`HAVING` filters rows before grouping; `WHERE` filters groups",
        "`WHERE` can only be used with numeric fields",
        "They are interchangeable synonyms in all ANSI SQL engines",
      ],
      correctIndex: 0,
      explanation: "`WHERE` filters individual records before aggregation, while `HAVING` filters the aggregated results created by `GROUP BY`.",
      difficulty: "intermediate",
    },
    {
      id: "sql-2",
      skillName: "SQL",
      question: "Which index type is best suited for high-cardinality columns queried with equality or range filters?",
      options: ["B-Tree index", "Bitmap index", "Full-text index", "Spatial index"],
      correctIndex: 0,
      explanation: "B-Tree indexes are the standard balanced tree structure optimal for equality (`=`) and range (`BETWEEN`, `<`, `>`) queries on high-cardinality columns.",
      difficulty: "intermediate",
    },
    {
      id: "sql-3",
      skillName: "SQL",
      question: "What property does the ACID acronym's 'I' represent in database transactions?",
      options: ["Integrity", "Isolation", "Immutability", "Indexing"],
      correctIndex: 1,
      explanation: "In ACID, 'I' stands for Isolation, ensuring concurrent transactions execute without interfering with one another.",
      difficulty: "beginner",
    },
    {
      id: "sql-4",
      skillName: "SQL",
      question: "What is the result of a `LEFT JOIN` when a row in the left table has no matching row in the right table?",
      options: [
        "The left row is omitted from the result set",
        "The left row is included with `NULL` in the columns of the right table",
        "The query errors out with a Foreign Key violation",
        "A duplicate left row is created",
      ],
      correctIndex: 1,
      explanation: "`LEFT JOIN` retains all records from the left table and populates columns from the right table with `NULL` when no match exists.",
      difficulty: "beginner",
    },
  ],

  "Machine Learning": [
    {
      id: "ml-1",
      skillName: "Machine Learning",
      question: "What is the primary consequence of high variance (overfitting) in a machine learning model?",
      options: [
        "High error on both training and test data",
        "Very low error on training data but poor generalization on unseen test data",
        "Slow inference latency with underutilized model parameters",
        "The loss function fails to converge to any minimum",
      ],
      correctIndex: 1,
      explanation: "High variance (overfitting) means the model has learned the training data noise, performing excellently on training data but poorly on test data.",
      difficulty: "beginner",
    },
    {
      id: "ml-2",
      skillName: "Machine Learning",
      question: "Which metric is most appropriate for evaluating a model on a highly imbalanced classification dataset (e.g. 99% negative, 1% positive)?",
      options: ["Accuracy", "Precision-Recall AUC / F1-Score", "Mean Squared Error", "R-squared"],
      correctIndex: 1,
      explanation: "On imbalanced data, accuracy is misleading (predicting all negative gives 99% accuracy). PR-AUC or F1-Score balances precision and recall on the minority class.",
      difficulty: "intermediate",
    },
    {
      id: "ml-3",
      skillName: "Machine Learning",
      question: "What technique prevents overfitting by adding a penalty proportional to the square of model weights?",
      options: ["L1 Regularization (Lasso)", "L2 Regularization (Ridge)", "Dropout only", "Min-Max Scaling"],
      correctIndex: 1,
      explanation: "L2 regularization (Ridge) adds the squared magnitude of coefficients ($\lambda \sum w_i^2$) to the loss function to shrink weights.",
      difficulty: "intermediate",
    },
    {
      id: "ml-4",
      skillName: "Machine Learning",
      question: "What does the ROC curve plot?",
      options: [
        "True Positive Rate (Sensitivity) vs. False Positive Rate (1 - Specificity)",
        "Precision vs. Recall",
        "Training Loss vs. Validation Loss",
        "Learning Rate vs. Batch Size",
      ],
      correctIndex: 0,
      explanation: "The ROC curve plots the True Positive Rate against the False Positive Rate at various classification threshold settings.",
      difficulty: "intermediate",
    },
  ],

  Docker: [
    {
      id: "docker-1",
      skillName: "Docker",
      question: "What is the main difference between a Docker image and a Docker container?",
      options: [
        "An image is an immutable template/blueprint, whereas a container is a running instance of that image",
        "A container is a VM requiring a guest OS kernel; an image is just a zip file",
        "Images run inside containers, not the other way around",
        "There is no difference; they are synonymous",
      ],
      correctIndex: 0,
      explanation: "A Docker image is a read-only snapshot containing the app code and dependencies; a container is the runnable instance with a writable layer.",
      difficulty: "beginner",
    },
    {
      id: "docker-2",
      skillName: "Docker",
      question: "Why should multi-stage builds be used in Dockerfiles?",
      options: [
        "To compile code in multiple programming languages simultaneously",
        "To separate build tools and intermediate artifacts from the final lightweight production image",
        "To automatically restart failing containers",
        "To bypass Docker layer caching",
      ],
      correctIndex: 1,
      explanation: "Multi-stage builds allow using heavy compilers in early stages while copying only the finished binaries into a minimal production image, shrinking size and attack surface.",
      difficulty: "intermediate",
    },
    {
      id: "docker-3",
      skillName: "Docker",
      question: "Which instruction in a Dockerfile sets the default command that cannot easily be overridden via CLI arguments?",
      options: ["CMD", "ENTRYPOINT", "RUN", "EXPOSE"],
      correctIndex: 1,
      explanation: "`ENTRYPOINT` configures a container that will run as an executable. Arguments passed to `docker run` append to it rather than replacing it (unlike `CMD`).",
      difficulty: "intermediate",
    },
    {
      id: "docker-4",
      skillName: "Docker",
      question: "What is the purpose of Docker volumes (`docker volume`)?",
      options: [
        "To persist data outside the container's writable layer and share data across containers",
        "To increase container RAM allocation",
        "To compress container logs into tar archives",
        "To encrypt network traffic between containers",
      ],
      correctIndex: 0,
      explanation: "Volumes are managed storage outside the container filesystem lifecycle, ensuring data persistence and safe sharing between containers.",
      difficulty: "beginner",
    },
  ],

  "UI/UX Design": [
    {
      id: "uiux-1",
      skillName: "UI/UX Design",
      question: "What is the WCAG 2.1 AA requirement for normal text contrast ratio against its background?",
      options: ["At least 2:1", "At least 3:1", "At least 4.5:1", "At least 7:1"],
      correctIndex: 2,
      explanation: "WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal body text, and at least 3:1 for large text (18pt+ or 14pt+ bold).",
      difficulty: "intermediate",
    },
    {
      id: "uiux-2",
      skillName: "UI/UX Design",
      question: "What does Fitts's Law state in interaction design?",
      options: [
        "The time to acquire a target is a function of the distance to and size of the target",
        "Users spend most of their time on other sites, so they prefer familiarity",
        "Working memory holds between 5 and 9 items at once",
        "Every extra second of load time increases bounce rate by 50%",
      ],
      correctIndex: 0,
      explanation: "Fitts's Law models the trade-off between speed and accuracy: larger, closer targets are faster and easier for users to click or tap.",
      difficulty: "intermediate",
    },
    {
      id: "uiux-3",
      skillName: "UI/UX Design",
      question: "What is the primary purpose of a design system?",
      options: [
        "To eliminate the need for designers on a team",
        "To provide a single source of truth containing reusable tokens, components, and patterns ensuring visual and UX consistency",
        "To generate production code directly from sketches without engineers",
        "To automate user research testing",
      ],
      correctIndex: 1,
      explanation: "A design system provides design tokens, reusable components, and documentation to build consistent, scalable products efficiently.",
      difficulty: "beginner",
    },
  ],

  "Node.js": [
    {
      id: "node-1",
      skillName: "Node.js",
      question: "Why should you avoid synchronous operations (like `fs.readFileSync`) in high-traffic Node.js request handlers?",
      options: [
        "They cause memory leaks in V8",
        "They block the single Node.js event loop thread, stopping all other concurrent requests from being processed",
        "They corrupt database connections",
        "Node.js will terminate the process after 30 seconds",
      ],
      correctIndex: 1,
      explanation: "Node.js runs on a single event-loop thread. Synchronous I/O halts the thread completely until the operation completes, freezing all concurrent requests.",
      difficulty: "intermediate",
    },
    {
      id: "node-2",
      skillName: "Node.js",
      question: "Which core module in Node.js allows creating child processes to run CPU-bound tasks in parallel?",
      options: ["cluster", "child_process", "worker_threads", "Both child_process and worker_threads"],
      correctIndex: 3,
      explanation: "Both `child_process` (spawning distinct OS processes) and `worker_threads` (running threads sharing memory) allow offloading CPU-intensive workloads.",
      difficulty: "intermediate",
    },
  ],

  "Data Analysis": [
    {
      id: "da-1",
      skillName: "Data Analysis",
      question: "What does a high Pearson correlation coefficient (e.g. r = 0.92) between variables X and Y imply?",
      options: [
        "Variable X causes variable Y to increase",
        "There is a strong positive linear relationship between X and Y, but not necessarily causation",
        "Variable Y is the independent variable",
        "The data is normally distributed",
      ],
      correctIndex: 1,
      explanation: "Correlation indicates strong linear association, but does not prove causation without experimental control.",
      difficulty: "beginner",
    },
    {
      id: "da-2",
      skillName: "Data Analysis",
      question: "When dealing with skewed numerical data with extreme outliers, which measure of central tendency is most robust?",
      options: ["Arithmetic Mean", "Median", "Standard Deviation", "Range"],
      correctIndex: 1,
      explanation: "The median represents the 50th percentile and is resistant to extreme outliers, whereas the mean gets pulled towards outliers.",
      difficulty: "beginner",
    },
  ],
};

/**
 * Generate diagnostic questions for a list of skills.
 * Falls back to sensible conceptual questions for any skill not in the curated bank.
 */
export function generateDiagnosticQuestionsForSkills(
  skillNames: string[],
  questionsPerSkill = 3
): DiagnosticQuestion[] {
  const result: DiagnosticQuestion[] = [];

  for (const skill of skillNames) {
    const curated = SKILL_QUESTION_BANK[skill];
    if (curated && curated.length > 0) {
      // Pick up to questionsPerSkill
      const slice = curated.slice(0, questionsPerSkill);
      result.push(...slice);
    } else {
      // Generate domain-focused diagnostic questions for custom / AYUSH / other skills
      result.push(
        {
          id: `diag-${skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}-1`,
          skillName: skill,
          question: `In industry practice, what represents the gold standard for verifying and benchmarking proficiency in ${skill}?`,
          options: [
            `Peer-reviewed artifact verification, reproducible benchmarks, and domain testing`,
            `Casual self-declaration on social media profiles without work proofs`,
            `Solely relying on theoretical definitions without practical implementations`,
            `Unverified third-party claims with no verifiable repository or sign-off`,
          ],
          correctIndex: 0,
          explanation: `True proficiency in ${skill} is validated through verified artifacts, rigorous testing, and reproducible outcomes.`,
          difficulty: "intermediate",
        },
        {
          id: `diag-${skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}-2`,
          skillName: skill,
          question: `When designing workflows or pipelines in ${skill}, which principle ensures operational robustness and consistency?`,
          options: [
            `Hardcoding configurations directly into business logic`,
            `Modular architecture, continuous validation, and automated error handling`,
            `Skipping logging and audit trails to optimize raw throughput`,
            `Executing all procedures without version control or rollback mechanisms`,
          ],
          correctIndex: 1,
          explanation: `Systematic modularity, active validation, and comprehensive auditability maintain high reliability in ${skill}.`,
          difficulty: "intermediate",
        },
        {
          id: `diag-${skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}-3`,
          skillName: skill,
          question: `Which methodology best prevents skill decay and ensures continuous compliance in ${skill}?`,
          options: [
            `One-time certification without continuing education or real project exposure`,
            `Periodic diagnostic re-evaluations, live project proofs of work, and peer sign-offs`,
            `Archiving older codebases without periodic dependency maintenance`,
            `Avoiding industry feedback loops to prevent scope changes`,
          ],
          correctIndex: 1,
          explanation: `Skill decay is mitigated by regular re-certification, hands-on application, and dual industry sign-offs.`,
          difficulty: "beginner",
        }
      );
    }
  }

  return result;
}

/**
 * Strip correct answers for safe client transmission.
 */
export function sanitizeQuestionsForClient(questions: DiagnosticQuestion[]): ClientDiagnosticQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    skillName: q.skillName,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  }));
}

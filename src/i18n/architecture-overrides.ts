import type { Locale } from "./locale"

export type ArchitectureTextOverride = {
  name: string
  summary: string
  description: string
  problem: string
  when_to_use: string[]
  when_not_to_use: string[]
  forces: string[]
  sweet_spot: string
  evidence?: string
}

export const ARCHITECTURE_OVERRIDES: Partial<Record<Locale, Record<string, ArchitectureTextOverride>>> = {
  es: {
    "supervisor-router": {
      name: "Supervisor / Router",
      summary: "Un coordinador enruta el trabajo a especialistas y fusiona los resultados.",
      description:
        "Un worker central clasifica o descompone el trabajo entrante, delega a workers especialistas y sintetiza sus salidas. Las aristas se expanden desde el supervisor y convergen en un nodo de fusión o respuesta final.",
      problem:
        "Los prompts monolíticos ocultan la lógica de enrutamiento y dificultan cambiar especialistas sin reescribir todo el sistema.",
      when_to_use: [
        "Las tareas se descomponen en roles especializados distintos (investigación, código, revisión).",
        "Necesitas un único responsable del enrutamiento, reintentos y empaquetado final.",
        "Los especialistas pueden ejecutarse con distintos modelos o conjuntos de herramientas.",
      ],
      when_not_to_use: [
        "Cada paso debe ejecutarse en orden estricto sin ramificaciones.",
        "El enrutamiento es lo bastante trivial para un solo worker con herramientas.",
        "Rutas sensibles a la latencia donde el fan-out paralelo es obligatorio desde el inicio.",
      ],
      forces: [
        "Propiedad clara en el nodo central",
        "Bajo acoplamiento entre especialistas",
        "Fácil añadir o reemplazar un nodo especialista",
      ],
      sweet_spot: "1 supervisor + 2–4 especialistas",
      evidence: "Patrón por defecto habitual en tutoriales de LangGraph y comparativas de swarm en τ-bench.",
    },
    "pipeline-critic": {
      name: "Pipeline + Critic",
      summary: "Planificar, ejecutar y verificar — cada etapa tiene un rol acotado.",
      description:
        "Los workers se ejecutan en serie: planificar o especificar, ejecutar la tarea principal y luego un critic o verificador valida la salida antes de publicarla. El flujo de control es mayormente lineal, con un bucle opcional de vuelta ante fallo.",
      problem:
        "La generación en un solo paso omite compuertas de calidad explícitas y dificulta detectar regresiones antes de que el usuario vea la salida.",
      when_to_use: [
        "Alta trazabilidad — cada etapa produce un artefacto con nombre.",
        "Las salidas deben pasar validaciones (política, pruebas, rúbrica) antes de publicarse.",
        "Los errores deben volver a una etapa anterior con retroalimentación estructurada.",
      ],
      when_not_to_use: [
        "Las subtareas son totalmente independientes y pueden ejecutarse en paralelo.",
        "La verificación es lo bastante barata para integrarla en el prompt de un solo worker.",
        "La latencia de extremo a extremo domina y las etapas en serie son demasiado lentas.",
      ],
      forces: [
        "Límites de etapa claros y rastro de auditoría",
        "Bucle explícito de verificación / reintento",
        "Mayor latencia que el fan-out paralelo",
      ],
      sweet_spot: "planificador + ejecutor + critic",
      evidence: "Alineado con bucles planificar–ejecutar–verificar en agentes de código en producción.",
    },
    "parallel-fanout": {
      name: "Fan-out paralelo",
      summary: "Distribuye el trabajo a workers en paralelo y fusiona aguas abajo.",
      description:
        "Un router o divisor envía subtareas independientes a workers en paralelo. Un sintetizador o reductor fusiona resultados parciales en una sola respuesta. Maximiza el throughput cuando las subtareas no dependen entre sí durante la ejecución.",
      problem:
        "Los pipelines en serie desperdician tiempo de reloj cuando las subtareas podrían ejecutarse en paralelo con ventanas de contexto separadas.",
      when_to_use: [
        "Las subtareas son independientes (investigación multi-fuente, llamadas a herramientas en paralelo).",
        "La latencia de reloj importa más que el gasto mínimo de tokens.",
        "La lógica de fusión está bien definida (concatenar, votar, sintetizar con LLM).",
      ],
      when_not_to_use: [
        "Pasos posteriores necesitan resultados intermedios de ramas paralelas en tiempo real.",
        "La calidad de la fusión es frágil y requiere refinamiento secuencial intensivo.",
        "El presupuesto es ajustado — las llamadas LLM en paralelo multiplican el costo.",
      ],
      forces: [
        "Mejor latencia de reloj para trabajo divisible",
        "Mayor costo agregado que un solo worker",
        "La etapa de fusión es un punto de fallo frecuente",
      ],
      sweet_spot: "router + 2–5 workers + merge",
      evidence: "Patrón estándar para flujos de agentes estilo map-reduce.",
    },
    "series-pipeline": {
      name: "Serie (pipeline)",
      summary: "Refinamiento secuencial — cada worker pasa su salida al siguiente (`A → B → C → D`).",
      description:
        "Los workers se ejecutan en una cadena estricta sin ramas paralelas. Cada etapa transforma o enriquece el artefacto del paso anterior. Más simple que Pipeline + Critic cuando no necesitas un bucle de verificación explícito.",
      problem:
        "La generación en un solo paso no puede refinar el contexto de forma iterativa — las etapas posteriores carecen de entregas estructuradas de especialistas anteriores.",
      when_to_use: [
        "El trabajo se descompone naturalmente en fases ordenadas (borrador → expandir → pulir).",
        "Cada etapa necesita el artefacto completo previo, no resultados parciales en paralelo.",
        "La lógica de ramificación y fusión añadiría complejidad sin beneficio.",
      ],
      when_not_to_use: [
        "Las subtareas son independientes y podrían ejecutarse en paralelo.",
        "Necesitas compuertas de calidad explícitas o bucles de revisión entre etapas.",
        "Un solo worker con herramientas puede cubrir toda la cadena a bajo costo.",
      ],
      forces: [
        "Máxima trazabilidad por etapa",
        "El tiempo de reloj se suma entre etapas",
        "Fácil de razonar y depurar",
      ],
      sweet_spot: "3–4 especialistas encadenados",
      evidence: "Patrón base en el catálogo de flujos secuenciales de CSIRO.",
    },
    "parallel-synthesizer": {
      name: "Paralelo + sintetizador",
      summary: "Análisis independientes en paralelo; un sintetizador fusiona las perspectivas.",
      description:
        "Un router distribuye el trabajo a analistas en paralelo (investigación, revisión de código, riesgo, etc.). Un worker sintetizador dedicado fusiona salidas divergentes en una respuesta coherente — con mayor énfasis en la calidad de la fusión que en el throughput bruto del fan-out.",
      problem:
        "Un análisis de una sola perspectiva pasa por alto contradicciones; concatenar salidas paralelas produce paquetes incoherentes.",
      when_to_use: [
        "Necesitas múltiples lentes independientes sobre la misma entrada.",
        "La calidad de la fusión importa — la síntesis es un paso de primera clase, no un añadido.",
        "Los analistas pueden discrepar; el sintetizador resuelve o prioriza hallazgos.",
      ],
      when_not_to_use: [
        "Las ramas paralelas producen tipos de artefacto idénticos que solo requieren concatenación.",
        "La síntesis es lo bastante trivial para que el router la maneje en línea.",
        "El costo de N analistas más un sintetizador supera el presupuesto.",
      ],
      forces: [
        "Mayor cobertura que un analista monolítico",
        "El sintetizador es el cuello de botella de calidad",
        "Mayor costo que fan-out paralelo sin fusión dedicada",
      ],
      sweet_spot: "router + 2–4 analistas + sintetizador",
      evidence: "Común en demos de agentes de investigación multi-fuente y due diligence.",
    },
    "hybrid-mixed-flow": {
      name: "Híbrido",
      summary: "Flujo de control mixto — ramas paralelas, condicionales y etapas secuenciales en un solo grafo.",
      description:
        "Combina enrutamiento, fan-out paralelo, nodos de control if/else y refinamiento en serie en un solo swarm. Úsalo cuando las tareas reales requieren formas distintas en distintas fases — no una topología pura de principio a fin.",
      problem:
        "Forzar un patrón puro de supervisor, pipeline o fan-out sobre flujos heterogéneos crea atajos incómodos y estado oculto.",
      when_to_use: [
        "Las fases difieren: p. ej. investigación paralela → borrador secuencial → ruta de despliegue condicional.",
        "Los nodos de control (if/else, while) pertenecen entre etapas de workers.",
        "Tienes trazas de prueba que demuestran qué ramas se activan en producción.",
      ],
      when_not_to_use: [
        "Una topología más simple cubre el 90% de las ejecuciones — empieza por ahí.",
        "El equipo aún no puede mantener o depurar grafos multi-forma.",
        "Sin observabilidad — los flujos híbridos fallan en silencio en ramas inesperadas.",
      ],
      forces: [
        "Máxima expresividad para tareas reales",
        "Lo más difícil de probar y documentar",
        "Requiere inspección de trazas sólida en el panel de pruebas de agentatlas",
      ],
      sweet_spot: "router + bloque paralelo + cola serial + controles",
      evidence: "Los swarms en producción suelen evolucionar a grafos híbridos tras diseños v1 lineales o de supervisor.",
    },
    "react-tool-loop": {
      name: "ReAct / Bucle de herramientas agéntico",
      summary:
        "Un solo agente itera Razonar → Actuar (llamada a herramienta) → Observar hasta alcanzar el objetivo — el bloque básico de la mayoría de agentes reales.",
      description:
        "Un agente capaz repite un ciclo de pensar y actuar. En cada paso elige una herramienta (búsqueda web, ejecución de código, scraping, etc.), observa el resultado y razona de nuevo. Sin workers en paralelo — toda la complejidad está en la selección de herramientas y el prompt. El agente decide cuándo se cumple el objetivo.",
      problem:
        "Los grafos multi-worker añaden sobrecarga de coordinación cuando un solo objetivo solo requiere uso iterativo de herramientas, no especialización paralela ni roles distintos.",
      when_to_use: [
        "Un objetivo es alcanzable con un agente capaz y las herramientas adecuadas (búsqueda, ejecución de código, scraping).",
        "El número de pasos es desconocido de antemano — el agente decide cuándo terminar.",
        "Añadir un segundo worker solo distribuiría el mismo conjunto de herramientas sin aportar especialización real.",
      ],
      when_not_to_use: [
        "Las tareas se descomponen en roles genuinamente distintos que requieren modelos o prompts diferentes.",
        "Necesitas throughput paralelo garantizado — el bucle es serial por naturaleza.",
        "El bucle podría iterar indefinidamente — añade un nodo While con maxIterations.",
      ],
      forces: [
        "Grafo más simple posible: un nodo worker",
        "Toda la inteligencia vive en el prompt del agente y la selección de herramientas",
        "Difícil de paralelizar; añade fan-out si el throughput importa",
      ],
      sweet_spot: "1 agente + 2–5 herramientas",
      evidence: "Base del function calling de OpenAI, el uso de herramientas de Claude y la mayoría de despliegues de un solo agente en producción.",
    },
    "debate-judge": {
      name: "Debate / Juez multi-perspectiva",
      summary:
        "Dos agentes argumentan posiciones opuestas; un juez independiente sintetiza y decide — expone puntos ciegos de forma sistemática.",
      description:
        "Un router envía la misma tarea a dos agentes con encuadres deliberadamente distintos (Pro vs Contra, Método A vs Método B, o Red Team vs Blue Team). Un agente Juez independiente lee ambos argumentos y emite un veredicto estructurado. El encuadre adversarial obliga a surfacear contraargumentos antes de comprometerse con una respuesta.",
      problem:
        "Las respuestas de un solo agente pueden ser erróneas con alta confianza. Analistas en paralelo con el mismo encuadre producen errores correlacionados. Una configuración adversarial estructurada expone contraargumentos y casos límite que la evaluación de una sola perspectiva no detecta.",
      when_to_use: [
        "Decisiones de alto impacto con dos encuadres válidos (política, verificación de hechos, revisión legal).",
        "Quieres exponer explícitamente contraargumentos antes de comprometerte con una respuesta.",
        "El juez puede guiarse con una rúbrica estructurada de evaluación.",
      ],
      when_not_to_use: [
        "La tarea no tiene una perspectiva opuesta significativa — el debate añade costo sin beneficio.",
        "La latencia es la restricción principal — mínimo 3 llamadas LLM en serie.",
        "Ambos agentes consultarán la misma fuente de recuperación y producirán salidas correlacionadas.",
      ],
      forces: [
        "Expone puntos ciegos y contraargumentos de forma sistemática",
        "La calidad del prompt del juez determina la calidad de la salida final",
        "Costo mínimo 3× frente al enfoque de un solo agente",
      ],
      sweet_spot: "2 debatientes + 1 juez",
      evidence: "Usado en evaluación de IA constitucional, red-teaming y flujos de revisión documental de alto impacto.",
    },
    "human-in-loop": {
      name: "Compuerta human-in-the-loop",
      summary:
        "Un punto de aprobación humana pausa el swarm hasta que una persona aprueba, rechaza o redirige — esencial para acciones irreversibles.",
      description:
        "Un nodo de compuerta de aprobación interrumpe el flujo de ejecución y espera entrada humana antes de continuar. Con aprobación, el grafo avanza al nodo de acción; con rechazo, vuelve a un worker de revisión. Añade un punto de control humano explícito sin cambiar el resto de la estructura del grafo.",
      problem:
        "Los swarms totalmente autónomos pueden tomar con confianza acciones irreversibles (enviar correos, desplegar código, cobrar tarjetas) sin ningún checkpoint. Las compuertas explícitas hacen visible, auditable y controlable el riesgo.",
      when_to_use: [
        "Las acciones son irreversibles: enviar, publicar, desplegar, cobrar, eliminar.",
        "Requisitos regulatorios o de cumplimiento exigen firma humana.",
        "La variabilidad de calidad de la salida es lo bastante alta como para que la revisión humana aporte valor fiable.",
      ],
      when_not_to_use: [
        "No hay humanos disponibles en la ventana de tiempo que exige la tarea.",
        "La acción es totalmente reversible y el costo del error es bajo.",
        "La automatización completa es el requisito explícito del producto.",
      ],
      forces: [
        "Hace explícito y auditable el riesgo irreversible",
        "Bloquea el throughput — la latencia depende del tiempo de respuesta humano",
        "Añade rastro de responsabilidad de nivel cumplimiento",
      ],
      sweet_spot: "1–2 workers + 1 compuerta de aprobación + humano",
      evidence: "Patrón de seguridad estándar en flujos agénticos en producción que manejan operaciones financieras, legales o irreversibles.",
    },
    "nested-swarm": {
      name: "Delegación de swarm anidado",
      summary:
        "Un orquestador delega subtareas complejas a swarms hijos especializados como cajas negras invocables — habilita composición modular reutilizable.",
      description:
        "Un agente orquestador de nivel superior descompone el trabajo e invoca swarms hijos como herramientas (run_swarm). Cada swarm hijo encapsula un flujo multi-paso completo; el padre solo ve entradas y salidas. Permite componer sistemas complejos de forma modular sin exponer la estructura interna del grafo entre límites. Los swarms hijos pueden desarrollarse y probarse de forma independiente.",
      problem:
        "Un grafo plano único se vuelve inmanejable a medida que crece la complejidad de la tarea. Anidar swarms como herramientas de caja negra habilita reutilización, pruebas independientes y propiedad por equipos de sub-flujos sin acoplar estado interno.",
      when_to_use: [
        "Una subtarea es lo bastante compleja como para justificar su propio grafo multi-worker.",
        "El mismo flujo hijo se reutiliza en varios swarms padres.",
        "Equipos distintos poseen swarms de forma independiente — se requiere acoplamiento débil.",
      ],
      when_not_to_use: [
        "La subtarea es lo bastante simple para un worker con herramientas.",
        "Se requiere compartir estado en tiempo real entre swarms — el anidamiento oculta el estado interno.",
        "El presupuesto de latencia es ajustado — cada ejecución anidada añade sobrecarga de llamada.",
      ],
      forces: [
        "Máxima componibilidad — los swarms hijos son reutilizables y probables de forma independiente",
        "Límite limpio: el padre solo ve entrada/salida del swarm",
        "Depurar requiere rastrear el historial de ejecución del hijo por separado",
      ],
      sweet_spot: "1 orquestador + 2–3 swarms hijos (3–5 workers cada uno)",
      evidence: "Común en sistemas agénticos en producción: un swarm de investigación alimenta uno de redacción, cada uno versionado de forma independiente.",
    },
  },
  en: {
    "swarm-roles-dinamicos": {
      name: "Dynamic and Bio-mimetic Roles",
      summary: "Autonomous agents with specialized roles that shift dynamically based on context.",
      description:
        "Decentralized agents follow simple bio-mimetic rules (inspired by ant or bee colonies). Communication is local and minimal to optimize collaboration without centralized control.",
      problem:
        "Rigid roles in changing environments create bottlenecks and vulnerability when key agents fail.",
      when_to_use: [
        "The environment is dynamic and requires task adaptability.",
        "You need high scalability and tolerance to individual agent failures.",
        "Global or centralized communication is inefficient.",
      ],
      when_not_to_use: [
        "A strict, predictable sequence of actions is required.",
        "Centralized supervision or real-time auditing is critical.",
      ],
      forces: [
        "High fault tolerance",
        "Low coupling and minimal communication",
        "Dynamic specialization",
      ],
      sweet_spot: "10–20 agents with fluid roles",
    },
    "swarm-llm-embebido": {
      name: "Embedded LLMs and Self-evolution",
      summary: "Each agent integrates a lightweight LLM for local reasoning and autonomous adaptation.",
      description:
        "Each swarm member runs a local LLM to interpret its environment and make decisions. They use P2P protocols to share state and implement a self-evolution module that adjusts strategies through collective feedback.",
      problem:
        "Agents with static rules cannot adapt to complex global objectives or unexpected changes in environmental semantics.",
      when_to_use: [
        "Agents must interpret natural language or complex global objectives.",
        "Continuous learning and improvement in swarm behavior is required.",
      ],
      when_not_to_use: [
        "Devices with extremely limited compute resources.",
        "Deterministic, formal behavior guarantees are required.",
      ],
      forces: [
        "Advanced local reasoning",
        "Self-organized semantic coordination",
        "High resource consumption (tokens/compute)",
      ],
      sweet_spot: "5–8 cognitive agents",
    },
    "swarm-llm-centralizado": {
      name: "Centralized LLM and Distributed Agents",
      summary: "A central LLM as cognitive orchestrator for simple executor agents.",
      description:
        "A single LLM hub interprets global state and dispatches adaptive directives to lightweight executor nodes. Unlike Supervisor/Router — where workers are full LLM agents with their own reasoning — executors here can be APIs, scripts, or physical actuators that only carry out instructions. All cognition is centralized; use this when you want cheap or zero-LLM executors.",
      problem:
        "Giving every agent an LLM is costly and inefficient, but a purely reactive swarm lacks strategic direction.",
      when_to_use: [
        "Complex centralized planning is required with distributed physical or local execution.",
        "A limited budget prevents running LLMs on every node.",
      ],
      when_not_to_use: [
        "Environments with critical latency or frequent loss of connectivity to the central node.",
        "A single point of failure (the central LLM) is unacceptable.",
      ],
      forces: [
        "Coherent centralized planning",
        "Low cost on executor nodes",
        "Vulnerability to single point of failure",
      ],
      sweet_spot: "1 controller + 5–10 executors",
    },
    "swarm-control-formal": {
      name: "Cohesion Control and Formal Guarantees",
      summary: "Nonlinear control models and formal algorithms to ensure stability under noise.",
      description:
        "Uses control layers based on nonlinear dynamics and mathematical algorithms to ensure global cohesion and dynamic stability of the swarm in noisy environments with changing topologies.",
      problem:
        "Purely heuristic or learning-based swarms can diverge or become unstable under real-world perturbations.",
      when_to_use: [
        "Critical physical systems (such as UAVs or mobile robotics) where collision or dispersion is catastrophic.",
        "Environments with high communication noise and highly dynamic topologies.",
      ],
      when_not_to_use: [
        "Purely software or data processing tasks without physical dynamics.",
        "Early exploration phases where stability metrics have not been defined.",
      ],
      forces: [
        "Mathematical stability guarantees",
        "Robustness against environmental noise",
        "High mathematical and modeling complexity",
      ],
      sweet_spot: "20–50 controlled nodes",
    },
    "swarm-mean-embeddings": {
      name: "Compact Representation and Learning (MARL)",
      summary: "State compression via mean embeddings or tensor factorization for reinforcement learning.",
      description:
        "Agents use compact representations of their neighbors to reduce communication overhead. Employs multi-agent reinforcement learning (MARL) and separates centralized training from distributed/asynchronous execution.",
      problem:
        "Exponential growth of state space and communication saturates the system as the number of agents scales.",
      when_to_use: [
        "Large-scale systems (hundreds of agents).",
        "A simulation environment is available for offline training.",
      ],
      when_not_to_use: [
        "Systems with few agents where compact representation loses useful precision.",
        "Prior or simulated training is not feasible.",
      ],
      forces: [
        "Massive theoretical scalability",
        "Drastic bandwidth reduction",
        "Costly and complex training phase",
      ],
      sweet_spot: "50–100 agents with MARL",
    },
    "swarm-homogeneo-minimalista": {
      name: "Minimalist Homogeneous Swarm",
      summary: "Identical agents with simple binary or single-bit communication.",
      description:
        "Simple, homogeneous agents interact locally through minimalist communication protocols (such as WOSP). Based on emergent collective behavior without requiring global synchronization or complex messages.",
      problem:
        "Heavy communication protocols cause network collisions and high energy consumption on constrained hardware.",
      when_to_use: [
        "Extremely simple or inexpensive hardware.",
        "Area coverage, patrol, or simple dispersion tasks.",
      ],
      when_not_to_use: [
        "Complex plan coordination or symbolic reasoning is required.",
      ],
      forces: [
        "Minimal hardware cost",
        "Ultra-light collision-free protocol",
        "Extremely simple individual behavior",
      ],
      sweet_spot: "100+ homogeneous agents",
    },
    "swarm-jerarquico-metaheuristico": {
      name: "Hierarchical Swarm with Metaheuristics",
      summary: "Dynamic hierarchies and hybrid optimization via PSO and genetic algorithms.",
      description:
        "Forms temporary hierarchies by assigning leaders based on context. Combines swarm behavior with optimization metaheuristics (such as Particle Swarm Optimization and genetic algorithms) to solve complex tasks in 3D spaces.",
      problem:
        "Lack of temporal structure makes it hard to solve complex subtasks that require sequencing.",
      when_to_use: [
        "Route optimization in 3D spaces (e.g. UAV swarms).",
        "Tasks that benefit from temporary hierarchical division.",
      ],
      when_not_to_use: [
        "Flat two-dimensional environments or simple text processing.",
      ],
      forces: [
        "Efficient global optimization",
        "Adaptable leadership without rigidity",
        "Complexity in synchronizing leaders",
      ],
      sweet_spot: "12–24 agents with sub-leaders",
    },
    "swarm-modular-asincrono": {
      name: "Asynchronous Modular Swarm",
      summary: "Modular roles (explorers, gatherers, coordinators) with asynchronous messaging.",
      description:
        "Based on SwarmSys, agents are divided into specialized modules for specific roles. They operate in iterative phases for continuous adaptation and communicate via asynchronous messages for flexibility and scalability.",
      problem:
        "Synchronous communication blocks agents and reduces exploration and gathering speed.",
      when_to_use: [
        "Search, exploration, or distributed resource gathering tasks.",
        "Systems where temporal decoupling of tasks is beneficial.",
      ],
      when_not_to_use: [
        "Systems that require immediate synchronous consensus at every step.",
      ],
      forces: [
        "Clear task specialization",
        "Complete temporal decoupling",
        "More complex global monitoring",
      ],
      sweet_spot: "3 roles × 4 agents each",
    },
  },
}

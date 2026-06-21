import { AgentCanvasNode } from "../agent"
import { CONTROL_FLOW_NODE_TYPES } from "./controlNodeRegistry"

/** React Flow `nodeTypes` map for the swarm editor canvas. */
export const SWARM_FLOW_NODE_TYPES = {
  agent: AgentCanvasNode,
  ...CONTROL_FLOW_NODE_TYPES,
}

import type { ACTIVITY, OFFICE_AGENTS } from "./constants";

/*********************
 * Types from constants
 *********************/
export type Activity = keyof typeof ACTIVITY;
export type AgentRole = keyof typeof OFFICE_AGENTS;

/*************************
 * Interface types
 * ************************/
export interface OfficeAgentState {
  role: AgentRole;
  activity: Activity;
  runs: number;
}

export interface Spot {
  x: number;
  y: number;
}

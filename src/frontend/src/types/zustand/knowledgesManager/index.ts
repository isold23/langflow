import { Edge, Node, Viewport, XYPosition } from "reactflow";
import { KnowledgeType } from "../../knowledge";

export type KnowledgesManagerStoreType = {
  knowledges: Array<KnowledgeType>;
  setKnowledges: (knowledges: KnowledgeType[]) => void;
  currentKnowledge: KnowledgeType | undefined;
  currentFlowId: string;
  setCurrentFlowId: (currentFlowId: string) => void;
  saveLoading: boolean;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  refreshKnowledges: () => Promise<void>;
  saveKnowledge: (knowledge: KnowledgeType, silent?: boolean) => Promise<void> | undefined;
  saveFlowDebounce: (
    flow: KnowledgeType,
    silent?: boolean
  ) => Promise<void> | undefined;
  autoSaveCurrentFlow: (
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => void;
  uploadKnowledges: () => Promise<void>;
  uploadKnowledge: ({
    newProject,
    file,
    isComponent,
    position,
  }: {
    newProject: boolean;
    file?: File;
    isComponent?: boolean;
    position?: XYPosition;
  }) => Promise<string | never>;
  addKnowledge: (
    newProject: boolean,
    flow?: KnowledgeType,
    override?: boolean,
    position?: XYPosition
  ) => Promise<string | undefined>;
  deleteComponent: (key: string) => Promise<void>;
  removeKnowledge: (id: string) => Promise<void>;
  saveComponent: (
    component: any,
    override: boolean
  ) => Promise<string | undefined>;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  examples: Array<KnowledgeType>;
  setExamples: (examples: KnowledgeType[]) => void;
};

export type UseUndoRedoOptions = {
  maxHistorySize: number;
  enableShortcuts: boolean;
};

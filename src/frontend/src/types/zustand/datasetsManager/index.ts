import { Edge, Node, Viewport, XYPosition } from "reactflow";
import { DatasetType } from "../../dataset";
import { DatasetInputType } from "../../../types/components";

export type DatasetsManagerStoreType = {
  datasets: Array<DatasetType>;
  setFlows: (flows: DatasetType[]) => void;
  currentDataset: DatasetType | undefined;
  currentDatasetId: string;
  setCurrentDatasetId: (currentDatasetId: string) => void;

  currentUserId: string;
  setCurrentUserId: (currentUserId: string) => void;

  currentKnowledgeId: string;
  setCurrentKnowledgeId: (currentKnowledgeId: string) => void;

  saveLoading: boolean;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  refreshDatasets: () => Promise<void>;
  saveFlow: (flow: DatasetType, silent?: boolean) => Promise<void> | undefined;
  saveFlowDebounce: (
    flow: DatasetType,
    silent?: boolean
  ) => Promise<void> | undefined;
  autoSaveCurrentFlow: (
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => void;
  uploadDatasets: (inputState: DatasetInputType) => Promise<void>;
  uploadDataset: ({
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
  addFlow: (
    newProject: boolean,
    flow?: DatasetType,
    override?: boolean,
    position?: XYPosition
  ) => Promise<string | undefined>;
  deleteComponent: (key: string) => Promise<void>;
  removeFlow: (id: string) => Promise<void>;
  saveComponent: (
    component: any,
    override: boolean
  ) => Promise<string | undefined>;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  examples: Array<DatasetType>;
  setExamples: (examples: DatasetType[]) => void;
};

export type UseUndoRedoOptions = {
  maxHistorySize: number;
  enableShortcuts: boolean;
};

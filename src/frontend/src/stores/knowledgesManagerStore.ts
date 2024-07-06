import { AxiosError } from "axios";
import { cloneDeep, debounce } from "lodash";
import { Edge, Node, Viewport, XYPosition } from "reactflow";
import { create } from "zustand";
import {
  SAVE_DEBOUNCE_TIME,
  STARTER_FOLDER_NAME,
} from "../constants/constants";
import {
  deleteKnowledge,
  readKnowledgesFromDatabase,
  saveKnowledgeToDatabase,
  uploadKnowledgesToDatabase,
  updateKnowledgeInDatabase,
} from "../controllers/API";
import { KnowledgeType, NodeDataType } from "../types/knowledge";
import {
  KnowledgesManagerStoreType,
  UseUndoRedoOptions,
} from "../types/zustand/knowledgesManager";
import {
  addVersionToDuplicates,
  createFlowComponent,
  createNewFlow,
  processDataFromFlow,
  processFlows,
} from "../utils/reactflowUtils";

import {
  createKnowledgeComponent,
  createNewKnowledge,
  processDataFromKnowledge,
  processKnowledges,
} from "../utils/reactknowledgeUtils"

import useAlertStore from "./alertStore";
import { useDarkStore } from "./darkStore";
import useFlowStore from "./flowStore";
import { useKnowledgeTypesStore } from "./typesStore";

let saveTimeoutId: NodeJS.Timeout | null = null;

const defaultOptions: UseUndoRedoOptions = {
  maxHistorySize: 100,
  enableShortcuts: true,
};

const past = {};
const future = {};

const useKnowledgesManagerStore = create<KnowledgesManagerStoreType>((set, get) => ({
  examples: [],
  setExamples: (examples: KnowledgeType[]) => {
    console.log("setExamples-------------------");
    set({ examples });
  },
  currentFlowId: "",
  setCurrentFlowId: (currentFlowId: string) => {
    console.log("setCurrentFlowId-------------------");
    set((state) => ({
      currentFlowId,
      currentKnowledge: state.knowledges.find((flow) => flow.id === currentFlowId),
    }));
  },
  knowledges: [],
  setKnowledges: (knowledges: KnowledgeType[]) => {
    console.log("setKnowledges-------------------");
    set({
      knowledges,
      currentKnowledge: knowledges.find((flow) => flow.id === get().currentFlowId),
    });
  },
  currentKnowledge: undefined,
  saveLoading: false,
  isLoading: true,
  setIsLoading: (isLoading: boolean) => {
    console.log("Knowledge isLoading: ", isLoading);
    set({ isLoading });
  },
  refreshKnowledges: () => {
    console.log("refreshKnowledges-------------------");
    return new Promise<void>((resolve, reject) => {
      console.log("refresh knowledges...");
      set({ isLoading: true });
      readKnowledgesFromDatabase()
        .then((dbData) => {
          if (dbData) {
            const { data, knowledges } = processKnowledges(dbData, false);
            get().setExamples(
              knowledges.filter(
                (f) => f.folder === STARTER_FOLDER_NAME && !f.user_id
              )
            );
            console.log("1 setKnowledges-----------------");
            get().setKnowledges(
              knowledges.filter(
                (f) => !(f.folder === STARTER_FOLDER_NAME && !f.user_id)
              )
            );
            useKnowledgeTypesStore.setState((state) => ({
              data: { ...state.data, ["saved_components"]: data },
            }));
            set({ isLoading: false });
            resolve();
          }
        })
        .catch((e) => {
          set({ isLoading: false });
          useAlertStore.getState().setErrorData({
            title: "Could not load knowledges from database",
          });
          reject(e);
        });
    });
  },
  autoSaveCurrentFlow: (nodes: Node[], edges: Edge[], viewport: Viewport) => {
    console.log("autoSaveCurrentFlow-------------------");
    if (get().currentKnowledge) {
      get().saveKnowledge(
        { ...get().currentKnowledge!, data: { nodes, edges, viewport } },
        true
      );
    }
  },
  saveKnowledge: (flow: KnowledgeType, silent?: boolean) => {
    console.log("saveKnowledge-------------------");
    set({ saveLoading: true }); // set saveLoading true immediately
    return get().saveFlowDebounce(flow, silent); // call the debounced function directly
  },
  saveFlowDebounce: debounce((knowledge: KnowledgeType, silent?: boolean) => {
    console.log("saveFlowDebounce-------------------");
    set({ saveLoading: true });
    return new Promise<void>((resolve, reject) => {
      updateKnowledgeInDatabase(knowledge)
        .then((updatedFlow) => {
          if (updatedFlow) {
            // updates flow in state
            if (!silent) {
              useAlertStore
                .getState()
                .setSuccessData({ title: "Changes saved successfully" });
            }
            console.log("2 setKnowledges-----------------");
            get().setKnowledges(
              get().knowledges.map((knowledge) => {
                if (knowledge.id === updatedFlow.id) {
                  return updatedFlow;
                }
                return knowledge;
              })
            );
            //update tabs state

            resolve();
            set({ saveLoading: false });
          }
        })
        .catch((err) => {
          useAlertStore.getState().setErrorData({
            title: "Error while saving changes",
            list: [(err as AxiosError).message],
          });
          reject(err);
        });
    });
  }, SAVE_DEBOUNCE_TIME),
  uploadKnowledges: () => {
    console.log("uploadKnowledges-------------------");
    return new Promise<void>((resolve) => {
      console.log("upload knowledges...");
      const input = document.createElement("input");
      input.type = "file";
      // add a change event listener to the file input
      input.onchange = (event: Event) => {
        // check if the file type is application/json
        if (
          (event.target as HTMLInputElement).files![0].type ===
          "application/json"
        ) {
          // get the file from the file input
          const file = (event.target as HTMLInputElement).files![0];
          // read the file as text
          const formData = new FormData();
          formData.append("file", file);
          uploadKnowledgesToDatabase(formData).then(() => {
            get()
              .refreshKnowledges()
              .then(() => {
                resolve();
              });
          });
        }
      };
      // trigger the file input click event to open the file dialog
      input.click();
    });
  },
  addKnowledge: async (
    newProject: Boolean,
    flow?: KnowledgeType,
    override?: boolean,
    position?: XYPosition
  ): Promise<string | undefined> => {
    console.log("addKnowledge-------------------");
    if (newProject) {
      let flowData = flow
        ? processDataFromKnowledge(flow)
        : { nodes: [], edges: [], viewport: { zoom: 1, x: 0, y: 0 } };

      // Create a new flow with a default name if no flow is provided.

      if (override) {
        get().deleteComponent(flow!.name);
        const newFlow = createNewKnowledge(flowData!, flow!);
        const { id } = await saveFlowToDatabase(newFlow);
        newFlow.id = id;
        //setTimeout  to prevent update state with wrong state
        setTimeout(() => {
          console.log("11 setKnowledges-----------------");

          const { data, flows } = processFlows([newFlow, ...get().knowledges]);
          console.log("3 setKnowledges-----------------");

          get().setKnowledges(flows);
          set({ isLoading: false });
          useKnowledgeTypesStore.setState((state) => ({
            data: { ...state.data, ["saved_components"]: data },
          }));
        }, 200);
        // addFlowToLocalState(newFlow);
        return;
      }

      const newFlow = createNewKnowledge(flowData!, flow!);

      const newName = addVersionToDuplicates(newFlow, get().knowledges);

      newFlow.name = newName;
      try {
        const { id } = await saveKnowledgeToDatabase(newFlow);
        // Change the id to the new id.
        newFlow.id = id;

        // Add the new flow to the list of flows.
        console.log("7 setKnowledges-----------------");

        const { data, flows } = processFlows([newFlow, ...get().knowledges]);
        console.log("8 setKnowledges-----------------");

        get().setKnowledges(flows);
        console.log("9 setKnowledges-----------------");

        set({ isLoading: false });
        useKnowledgeTypesStore.setState((state) => ({
          data: { ...state.data, ["saved_components"]: data },
        }));

        // Return the id
        return id;
      } catch (error) {
        // Handle the error if needed
        throw error; // Re-throw the error so the caller can handle it if needed
      }
    } else {
      useFlowStore
        .getState()
        .paste(
          { nodes: flow!.data!.nodes, edges: flow!.data!.edges },
          position ?? { x: 10, y: 10 }
        );
    }
  },
  removeKnowledge: async (id: string) => {
    console.log("removeKnowledge-------------------");
    return new Promise<void>((resolve) => {
      const index = get().knowledges.findIndex((flow) => flow.id === id);
      if (index >= 0) {
        deleteKnowledge(id).then(() => {
          console.log("21 setKnowledges-----------------");

          const { data, flows } = processFlows(
            get().knowledges.filter((flow) => flow.id !== id)
          );
          console.log("22 setKnowledges-----------------");

          get().setKnowledges(flows);
          console.log("23 setKnowledges-----------------");

          set({ isLoading: false });
          useKnowledgeTypesStore.setState((state) => ({
            data: { ...state.data, ["saved_components"]: data },
          }));
          resolve();
        });
      }
    });
  },
  deleteComponent: async (key: string) => {
    console.log("deleteComponent-------------------");
    return new Promise<void>((resolve) => {
      let componentFlow = get().knowledges.find(
        (componentFlow) =>
          componentFlow.is_component && componentFlow.name === key
      );

      if (componentFlow) {
        get()
          .removeKnowledge(componentFlow.id)
          .then(() => {
            resolve();
          });
      }
    });
  },
  uploadKnowledge: async ({
    newProject,
    file,
    isComponent = false,
    position = { x: 10, y: 10 },
  }: {
    newProject: boolean;
    file?: File;
    isComponent?: boolean;
    position?: XYPosition;
  }): Promise<string | never> => {
    console.log("uploadKnowledge-------------------");
    return new Promise(async (resolve, reject) => {
      let id;
      if (file) {
        let text = await file.text();
        let fileData = JSON.parse(text);
        if (
          newProject &&
          ((!fileData.is_component && isComponent === true) ||
            (fileData.is_component !== undefined &&
              fileData.is_component !== isComponent))
        ) {
          reject("You cannot upload a component as a flow or vice versa");
        } else {
          if (fileData.flows) {
            fileData.flows.forEach((flow: KnowledgeType) => {
              id = get().addKnowledge(newProject, flow, undefined, position);
            });
            resolve("");
          } else {
            id = await get().addKnowledge(newProject, fileData, undefined, position);
            resolve(id);
          }
        }
      } else {
        // create a file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        // add a change event listener to the file input
        input.onchange = async (e: Event) => {
          if (
            (e.target as HTMLInputElement).files![0].type === "application/json"
          ) {
            const currentfile = (e.target as HTMLInputElement).files![0];
            let text = await currentfile.text();
            let fileData: KnowledgeType = await JSON.parse(text);

            if (
              (!fileData.is_component && isComponent === true) ||
              (fileData.is_component !== undefined &&
                fileData.is_component !== isComponent)
            ) {
              reject("You cannot upload a component as a flow or vice versa");
            } else {
              id = await get().addKnowledge(newProject, fileData);
              resolve(id);
            }
          }
        };
        // trigger the file input click event to open the file dialog
        input.click();
      }
    });
  },
  saveComponent: (component: NodeDataType, override: boolean) => {
    console.log("saveComponent-------------------");

    component.node!.official = false;
    return get().addKnowledge(
      true,
      createKnowledgeComponent(component, useDarkStore.getState().version),
      override
    );
  },
  takeSnapshot: () => {
    console.log("takeSnapshot-------------------");
    const currentFlowId = get().currentFlowId;
    // push the current graph to the past state
    const flowStore = useFlowStore.getState();
    const newState = {
      nodes: cloneDeep(flowStore.nodes),
      edges: cloneDeep(flowStore.edges),
    };
    const pastLength = past[currentFlowId]?.length ?? 0;
    if (
      pastLength > 0 &&
      JSON.stringify(past[currentFlowId][pastLength - 1]) ===
        JSON.stringify(newState)
    )
      return;
    if (pastLength > 0) {
      past[currentFlowId] = past[currentFlowId].slice(
        pastLength - defaultOptions.maxHistorySize + 1,
        pastLength
      );

      past[currentFlowId].push(newState);
    } else {
      past[currentFlowId] = [newState];
    }

    future[currentFlowId] = [];
  },
  undo: () => {
    console.log("undo-------------------");

    const newState = useFlowStore.getState();
    const currentFlowId = get().currentFlowId;
    const pastLength = past[currentFlowId]?.length ?? 0;
    const pastState = past[currentFlowId]?.[pastLength - 1] ?? null;

    if (pastState) {
      past[currentFlowId] = past[currentFlowId].slice(0, pastLength - 1);

      if (!future[currentFlowId]) future[currentFlowId] = [];
      future[currentFlowId].push({
        nodes: newState.nodes,
        edges: newState.edges,
      });

      newState.setNodes(pastState.nodes);
      newState.setEdges(pastState.edges);
    }
  },
  redo: () => {
    console.log("redo-------------------");

    const newState = useFlowStore.getState();
    const currentFlowId = get().currentFlowId;
    const futureLength = future[currentFlowId]?.length ?? 0;
    const futureState = future[currentFlowId]?.[futureLength - 1] ?? null;

    if (futureState) {
      future[currentFlowId] = future[currentFlowId].slice(0, futureLength - 1);

      if (!past[currentFlowId]) past[currentFlowId] = [];
      past[currentFlowId].push({
        nodes: newState.nodes,
        edges: newState.edges,
      });

      newState.setNodes(futureState.nodes);
      newState.setEdges(futureState.edges);
    }
  },
}));

export default useKnowledgesManagerStore;

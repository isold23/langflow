import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaginatorComponent from "../../../../components/PaginatorComponent";
import CollectionCardComponent from "../../../../components/cardComponent";
import CardsWrapComponent from "../../../../components/cardsWrapComponent";
import IconComponent from "../../../../components/genericIconComponent";
import { SkeletonCardComponent } from "../../../../components/skeletonCardComponent";
import { Button } from "../../../../components/ui/button";
import {
  CONSOLE_ERROR_MSG,
  UPLOAD_ALERT_LIST,
  WRONG_FILE_ERROR_ALERT,
} from "../../../../constants/alerts_constants";
import useAlertStore from "../../../../stores/alertStore";
import useFlowsManagerStore from "../../../../stores/flowsManagerStore";
import useKnowledgesManagerStore from "../../../../stores/knowledgesManagerStore";
import { FlowType } from "../../../../types/flow";

export default function KnowledgeDatasetComponent() {
  const setCurrentKnowledgeId = useKnowledgesManagerStore(
    (state) => state.setCurrentKnowledgeId
  );
  console.log("---------KnowledgeDatasetComponent------");
  const addFlow = useFlowsManagerStore((state) => state.addFlow);
  const uploadFlow = useFlowsManagerStore((state) => state.uploadFlow);
  const removeFlow = useFlowsManagerStore((state) => state.removeFlow);
  const isLoading = useFlowsManagerStore((state) => state.isLoading);
  const setExamples = useFlowsManagerStore((state) => state.setExamples);
  const flows = useFlowsManagerStore((state) => state.flows);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [loadingScreen, setLoadingScreen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("KnowledgeDatasetComponent useEffect isLoading: ", isLoading);
    console.log("KnowledgeDatasetComponent useEffect----------------1");
    if (isLoading) return;
    console.log("KnowledgeDatasetComponent useEffect----------------2 flows length: ", flows.length);
    let all = flows
      .sort((a, b) => {
        if (a?.updated_at && b?.updated_at) {
          return (
            new Date(b?.updated_at!).getTime() -
            new Date(a?.updated_at!).getTime()
          );
        } else if (a?.updated_at && !b?.updated_at) {
          return 1;
        } else if (!a?.updated_at && b?.updated_at) {
          return -1;
        } else {
          return (
            new Date(b?.date_created!).getTime() -
            new Date(a?.date_created!).getTime()
          );
        }
      });
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    setData(all.slice(start, end));
  }, [flows, isLoading, pageIndex, pageSize]);

  const [data, setData] = useState<FlowType[]>([]);
/*
  const onFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types.some((types) => types === "Files")) {
      if (e.dataTransfer.files.item(0).type === "application/json") {
        uploadFlow({
          newProject: true,
          file: e.dataTransfer.files.item(0)!,
          isComponent: is_component,
        })
          .then(() => {
            setSuccessData({
              title: `${
                is_component ? "Component" : "Flow"
              } uploaded successfully`,
            });
          })
          .catch((error) => {
            setErrorData({
              title: CONSOLE_ERROR_MSG,
              list: [error],
            });
          });
      } else {
        setErrorData({
          title: WRONG_FILE_ERROR_ALERT,
          list: [UPLOAD_ALERT_LIST],
        });
      }
    }
  };
*/
  function resetFilter() {
    setPageIndex(1);
    setPageSize(20);
  }

  console.log("Flow isLoading: ", isLoading, "data length: ", data.length);
  return (
      <div className="flex h-full w-full flex-col justify-between">
        <div className="flex w-full flex-col gap-4">
          <h1>upload file-----------</h1>
        </div>
      </div>
  );
}

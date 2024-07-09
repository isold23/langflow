import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaginatorComponent from "../../../../components/PaginatorComponent";
import CollectionCardComponent from "../../../../components/cardComponent";
import CollectionKnowledgeComponent from "../../../../components/knowledgeComponent";
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
import useKnowledgesManagerStore from "../../../../stores/knowledgesManagerStore";
import { KnowledgeType } from "../../../../types/knowledge";

export default function KnowledgesComponentsComponent({
}: {
}) {
  console.log("1 KnowledgeComponentsComponent---------------------");
  const addKnowledge = useKnowledgesManagerStore((state) => state.addKnowledge);
  const uploadKnowledge = useKnowledgesManagerStore((state) => state.uploadKnowledge);
  const removeKnowledge = useKnowledgesManagerStore((state) => state.removeKnowledge);
  //const isLoading = useKnowledgesManagerStore((state) => state.isLoading);
  const [isLoading, setIsLoading] = useState(false);
  const setExamples = useKnowledgesManagerStore((state) => state.setExamples);
  const knowledges = useKnowledgesManagerStore((state) => state.knowledges);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [loadingScreen, setLoadingScreen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect isLoading: ", isLoading);
    console.log("useEffect----------------1");
    if (isLoading) return;
    console.log("useEffect----------------2 knowledges length: ", knowledges.length);
    let all = knowledges
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
    console.log("page ---------------- pageSize: ", pageSize, "pageIndex: ", pageIndex);
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    console.log("page ----------------start: ", start, " end: ", end);
    setData(all.slice(start, end));
    console.log("setData end...........");
  }, [knowledges, isLoading, pageIndex, pageSize]);

  const [data, setData] = useState<KnowledgeType[]>([]);

  const onFileDrop = (e) => {
    console.log("onFileDrop---------");
    e.preventDefault();
    if (e.dataTransfer.types.some((types) => types === "Files")) {
      if (e.dataTransfer.files.item(0).type === "application/json") {
        uploadKnowledge({
          newProject: true,
          file: e.dataTransfer.files.item(0)!,
        })
          .then(() => {
            setSuccessData({
              title: `${
                "Knowledge"
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

  function resetFilter() {
    setPageIndex(1);
    setPageSize(20);
  }
  console.log("2 KnowledgeComponentsComponent---------------------");
  console.log('isLoading: ', isLoading);
  console.log('data length: ', data.length);
  return (
    <CardsWrapComponent
      onFileDrop={onFileDrop}
      dragMessage={`Drag your ${name} here`}
    >
      <div className="flex h-full w-full flex-col justify-between">
        <div className="flex w-full flex-col gap-4">
          {!isLoading && data.length === 0 ? (
            <div className="mt-6 flex w-full items-center justify-center text-center">
              <div className="flex-max-width h-full flex-col">
                <div className="flex w-full flex-col gap-4">
                  <div className="grid w-full gap-4">
                    Knowledges can be created using Langflow.
                  </div>
                  <div className="align-center flex w-full justify-center gap-1">
                    <span>New?</span>
                    <span className="transition-colors hover:text-muted-foreground">
                      <button
                        onClick={() => {
                          addKnowledge(true).then((id) => {
                            navigate("/knowledges/" + id);
                          });
                        }}
                        className="underline"
                      >
                        Start Here
                      </button>
                      .
                    </span>
                    <span className="animate-pulse">🚀</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
              {
              isLoading === false && data?.length > 0 ? (
                data?.map((item, idx) => (
                  <CollectionKnowledgeComponent
                    onDelete={() => {
                      removeKnowledge(item.id);
                      setSuccessData({
                        title: `${
                          item.is_component ? "Component" : "Knowledge"
                        } deleted successfully!`,
                      });
                      resetFilter();
                    }}
                    key={idx}
                    data={item}
                    disabled={isLoading}
                    button={
                        <Link to={"/knowledge/" + item.id}>
                          <Button
                            tabIndex={-1}
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap "
                            data-testid={
                              "edit-knowledge-button-" + item.id + "-" + idx
                            }
                          >
                            <IconComponent
                              name="ExternalLink"
                              className="main-page-nav-button select-none"
                            />
                            Edit Knowledge22222
                          </Button>
                        </Link>
                    }
                  />
                ))
              ) : (
                <>
                  <SkeletonCardComponent />
                  <SkeletonCardComponent />
                </>
              )}
            </div>
          )}
        </div>
        {!isLoading && data.length > 0 && (
          <div className="relative py-6">
            <PaginatorComponent
              storeComponent={true}
              pageIndex={pageIndex}
              pageSize={pageSize}
              rowsCount={[10, 20, 50, 100]}
              totalRowsCount={
                knowledges.length
              }
              paginate={(pageSize, pageIndex) => {
                setPageIndex(pageIndex);
                setPageSize(pageSize);
              }}
            ></PaginatorComponent>
          </div>
        )}
      </div>
    </CardsWrapComponent>
  );
}

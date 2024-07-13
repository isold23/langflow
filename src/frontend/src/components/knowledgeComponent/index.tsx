import { useEffect, useState } from "react";
import { getComponent, postLikeComponent } from "../../controllers/API";
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";
import useAlertStore from "../../stores/alertStore";
import useFlowsManagerStore from "../../stores/flowsManagerStore";
import useKnowledgesManagerStore from "../../stores/knowledgesManagerStore";
import { useStoreStore } from "../../stores/storeStore";
import { storeComponent } from "../../types/store";
import cloneFLowWithParent from "../../utils/storeUtils";
import { cloneKnowledgeWithParent } from "../../utils/storeUtils";
import { cn } from "../../utils/utils";
import ShadTooltip from "../ShadTooltipComponent";
import IconComponent from "../genericIconComponent";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { KnowledgeType } from "../../types/knowledge";

export default function CollectionKnowledgeComponent ({
  data,
  authorized = true,
  disabled = false,
  button,
  onDelete,
}: {
  data: KnowledgeType;
  authorized?: boolean;
  disabled?: boolean;
  button?: JSX.Element;
  onDelete?: () => void;
}) {
  console.log("3 CollectionKnowledgeComponent---------------------");
  const addKnowledge = useKnowledgesManagerStore((state) => state.addKnowledge);
  const saveKnowledge = useKnowledgesManagerStore((state) => state.saveKnowledge);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const setValidApiKey = useStoreStore((state) => state.updateValidApiKey);
  const isStore = false;
  const [loading, setLoading] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const name = data.is_component ? "Component" : "Flow";

  useEffect(() => {
    if (data) {
      console.log("------------------useEffect---//////// data: ", data);
    }
  }, [data]);

  function handleInstall() {
    console.log("------handleInstall--------");
    setLoading(true);
    getComponent(data.id)
      .then((res) => {
        const newFlow = cloneKnowledgeWithParent(res, res.id);
        addKnowledge(true, newFlow)
          .then((id) => {
            setSuccessData({
              title: `${name} ${
                isStore ? "Downloaded" : "Installed"
              } Successfully.`,
            });
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            setErrorData({
              title: `Error ${
                isStore ? "downloading" : "installing"
              } the ${name}`,
              list: [error["response"]["data"]["detail"]],
            });
          });
      })
      .catch((err) => {
        setLoading(false);
        setErrorData({
          title: `Error ${isStore ? "downloading" : "installing"} the ${name}`,
          list: [err["response"]["data"]["detail"]],
        });
      });
  }
  console.log("----------------4444-----");
  return (
    <Card
      className={cn(
        "group relative flex min-h-[11rem] flex-col justify-between overflow-hidden transition-all hover:shadow-md",
        disabled ? "pointer-events-none opacity-50" : ""
      )}
    >
      <div>
        <CardHeader>
          <div>
            <CardTitle className="flex w-full items-center justify-between gap-3 text-xl">
              <IconComponent
                className={cn(
                  "flex-shrink-0",
                  data.is_component
                    ? "mx-0.5 h-6 w-6 text-component-icon"
                    : "h-7 w-7 flex-shrink-0 text-flow-icon"
                )}
                name={data.is_component ? "ToyBrick" : "Group"}
              />
              <ShadTooltip content={data.name}>
                <div className="w-full truncate">{data.name}</div>
              </ShadTooltip>
              {onDelete && (
                <DeleteConfirmationModal
                  onConfirm={() => {
                    onDelete();
                  }}
                >
                  <IconComponent
                    name="Trash2"
                    className="h-5 w-5 text-primary opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                  />
                </DeleteConfirmationModal>
              )}
            </CardTitle>
          </div>
          <CardDescription className="pb-2 pt-2">
            <div className="truncate-doubleline">{data.description}</div>
          </CardDescription>
        </CardHeader>
      </div>

      <CardFooter>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex w-full flex-wrap items-end justify-between gap-2">
            <div className="flex w-full flex-1 flex-wrap gap-2">
            </div>
            {button && button}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

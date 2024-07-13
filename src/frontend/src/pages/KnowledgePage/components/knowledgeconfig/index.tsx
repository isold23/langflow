import * as Form from "@radix-ui/react-form";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaginatorComponent from "../../../../components/PaginatorComponent";
import CollectionCardComponent from "../../../../components/cardComponent";
import CardsWrapComponent from "../../../../components/cardsWrapComponent";
import IconComponent from "../../../../components/genericIconComponent";
import { SkeletonCardComponent } from "../../../../components/skeletonCardComponent";
import { Button } from "../../../../components/ui/button";
import { CONTROL_UPDATE_KNOWLEDGE } from "../../../../constants/constants";
import {
  KNOWLEDGE_ADD_ERROR_ALERT,
  KNOWLEDGE_UPDATE_SUCCESS_ALERT,
} from "../../../../constants/alerts_constants"
import {
  KnowledgeInputType,
  KnowledgeManagementType,
  inputHandlerEventType,
} from "../../../../types/components"
import {
  CONSOLE_ERROR_MSG,
  UPLOAD_ALERT_LIST,
  WRONG_FILE_ERROR_ALERT,
} from "../../../../constants/alerts_constants";
import useAlertStore from "../../../../stores/alertStore";
import useKnowledgesManagerStore from "../../../../stores/knowledgesManagerStore";
import { KnowledgeType } from "../../../../types/knowledge";
import { addKnowledge, updateKnowledge } from "../../../../controllers/API";

export default function KnowledgeConfigComponent() {
  const currentKnowledge = useKnowledgesManagerStore((state) => state.currentKnowledge);
  const [inputState, setInputState] = useState<KnowledgeInputType>(CONTROL_UPDATE_KNOWLEDGE);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const [name, setKnowledgeName] = useState(currentKnowledge?.name ?? "");
  const [id, setKnowledgeID] = useState(currentKnowledge?.id ?? "");
  const navigate = useNavigate();
  console.log("KnowledgeConfigComponent name: ", name, " id: ", id);

  useEffect(() => {
    if (!name) {

    } else {
      //handleInput({ target: { name: "name", value: name } });
    }
  }, [open]);

  function handleInput({
    target: { name, value },
  }: inputHandlerEventType): void {
    setInputState((prev) => ({ ...prev, [name]: value }));
  }

  function handleNewKnowledge(knowledge: KnowledgeInputType) {
    knowledge.id = id;
    console.log("handleNewKnowledge id: ", knowledge.id, " name: ", knowledge.name);
    updateKnowledge(knowledge.id, {
      name: knowledge.name,
    }).then((res) => {
      setSuccessData({
        title: KNOWLEDGE_UPDATE_SUCCESS_ALERT,
      });
    })
      .catch((error) => {
        setErrorData({
          title: KNOWLEDGE_ADD_ERROR_ALERT,
          list: [error.response.data.detail],
        });
      });
  }

  return (
    <Form.Root
      onSubmit={(event) => {
        handleNewKnowledge(inputState);
        event.preventDefault();
      }}
    >
      <div className="grid gap-5">
        <Form.Field name="name">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Form.Label className="data-[invalid]:label-invalid">
              Knowledgename{" "}
              <span className="font-medium text-destructive">*</span>
            </Form.Label>
          </div>
          <Form.Control asChild>
            <input
              onChange={({ target: { value } }) => {
                handleInput({ target: { name: "name", value } });
                setKnowledgeName(value);
              }}
              value={name}
              className="primary-input"
              required
              placeholder="Knowledgename"
            />
          </Form.Control>
          <Form.Message match="valueMissing" className="field-invalid">
            Please enter your knowledge name
          </Form.Message>
        </Form.Field>
      </div>
      <div className="float-right">
        <Button
          variant="outline"
          onClick={() => {

          }}
          className="mr-3"
        >
          Cancle
        </Button>
        <Form.Submit asChild>
          <Button className="mt-8">Save</Button>
        </Form.Submit>
      </div>
    </Form.Root>

  );
}

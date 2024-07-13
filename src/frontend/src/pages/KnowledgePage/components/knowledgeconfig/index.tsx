import * as Form from "@radix-ui/react-form";

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
import useKnowledgesManagerStore from "../../../../stores/knowledgesManagerStore";
import { FlowType } from "../../../../types/flow";
import { KnowledgeManagementType } from "../../../../types/components";
import { KnowledgeType } from "../../../../types/knowledge";

export default function KnowledgeConfigComponent({
  name,
  description,
}: KnowledgeType) {
  console.log("---------KnowledgeConfigComponent------");
  const navigate = useNavigate();
  const [name1, setKnowledgeName] = useState(name ?? "");
  console.log("KnowledgeConfigComponent name: ", name);

  useEffect(() => {
    if (!name) {
      resetForm();
    } else {
      //handleInput({ target: { name: "name", value: name } });
    }
  }, [open]);

  function resetForm() {
    setKnowledgeName("");
  }

  return (
    <Form.Root
          onSubmit={(event) => {
            resetForm();
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
                    //handleInput({ target: { name: "name", value } });
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

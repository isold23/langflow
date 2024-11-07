import * as Form from "@radix-ui/react-form";
import { useContext, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import InputComponent from "../../components/inputComponent";
import IconComponent from "../../components/genericIconComponent";
import { CONTROL_NEW_DATASET } from "../../constants/constants";
import { AuthContext } from "../../contexts/authContext";
import useDatasetsManagerStore from "../../stores/datasetsManagerStore";
import {
  DatasetInputType,
  DatasetType,
  inputHandlerEventType,
} from "../../types/components";

import { nodeIconsLucide } from "../../utils/styleUtils";
import BaseModal from "../baseModal";

export default function DatasetModal({
  title,
  titleHeader,
  userId,
  knowledgeId,
  cancelText,
  confirmationText,
  children,
  icon,
  data,
  index,
  onConfirm,
  asChild,
}: DatasetType) {
  const Icon: any = nodeIconsLucide[icon];
  const [open, setOpen] = useState(false);
  const [documentname, setDocumentName] = useState(data?.documentname ?? "");
  const [embeddings, setEmbeddings] = useState(data?.embeddings ?? "");
  const [model, setModel] = useState(data?.model ?? "");
  const uploadDatasets = useDatasetsManagerStore((state) => state.uploadDatasets);
  const setCurrentUserId = useDatasetsManagerStore((state) => state.setCurrentUserId);
  const setCurrentKnowledgeId = useDatasetsManagerStore((state) => state.setCurrentKnowledgeId);
  const [inputState, setInputState] = useState<DatasetInputType>(CONTROL_NEW_DATASET);
  const { userData } = useContext(AuthContext);

  function handleInput({
    target: { name, value },
  }: inputHandlerEventType): void {
    setInputState((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (!data) {
      resetForm();
    } else {
      console.log("data: ", data, "userId: ", userId, "knowledgeId: ", knowledgeId,
        "documentname: ", documentname, "embeddings: ", embeddings, "model: ",model
      );
      handleInput({ target: { name: "documentname", value: documentname } });
      handleInput({ target: { name: "embeddings", value: embeddings } });
      handleInput({ target: { name: "model", value: model } });
      //handleInput({ target: { name: "userId", value: userId } });
      //handleInput({ target: { name: "knowledgeId", value: knowledgeId } });
    }
  }, [open]);

  function resetForm() {
    setEmbeddings("");
    setDocumentName("");
    setModel("");
    setCurrentUserId(userId);
    setCurrentKnowledgeId(knowledgeId);
  }

  return (
    <BaseModal size="medium-h-full" open={open} setOpen={setOpen}>
      <BaseModal.Trigger asChild={asChild}>{children}</BaseModal.Trigger>
      <BaseModal.Header description={titleHeader}>
        <span className="pr-2">{title}</span>
        <Icon
          name="icon"
          className="h-6 w-6 pl-1 text-foreground"
          aria-hidden="true"
        />
      </BaseModal.Header>
      <BaseModal.Content>
        <Form.Root
          onSubmit={(event) => {
            //resetForm();
            inputState.user_id = userId;
            inputState.knowledge_id = knowledgeId;
            console.log("88888 before submit: ", inputState);
            
            onConfirm(1, inputState);
            console.log("88888 after submit: ", inputState);
            setOpen(false);
            event.preventDefault();
          }}
        >
          <div className="grid gap-5">
            <Form.Field name="documentname">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <Form.Label className="data-[invalid]:label-invalid">
                  Documentname{" "}
                  <span className="font-medium text-destructive">*</span>
                </Form.Label>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Form.Control asChild>
                  <input
                    id="dataset_uploadfile_documentname"
                    onChange={({ target: { value } }) => {
                      //handleInput({ target: { name: "documentname", value } });
                      console.log("00000000000 documentname: ", value);
                      setDocumentName(value);
                      inputState.documentname = value;
                    }}
                    value={documentname}
                    className="primary-input"
                    required
                    placeholder="LocalFile"
                  />
                </Form.Control>
                <Form.Message match="valueMissing" className="field-invalid">
                </Form.Message>
                <Button
                  variant="primary"
                  onClick={() => {
                    uploadDatasets(inputState)
                  }}
                >
                  <IconComponent name="Upload" className="main-page-nav-button" />
                </Button>
              </div>
            </Form.Field>

            <Form.Field name="embeddings">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <Form.Label className="data-[invalid]:label-invalid">
                  Embeddings{" "}
                  <span className="font-medium text-destructive">*</span>
                </Form.Label>
              </div>
              <Form.Control asChild>
                <InputComponent
                  setSelectedOption={(e) => {
                    console.log("88888 embeddings: ", e);
                    setEmbeddings(e);
                    inputState.embeddings = e;
                  }}
                  selectedOption={embeddings}
                  password={false}
                  options={["ollama embedding", "openai embedding", "huggingface embedding"]}
                  placeholder="Choose a type for the variable..."
                  id={"type-global-variables"}
                ></InputComponent>
              </Form.Control>
              <Form.Message match="valueMissing" className="field-invalid">
                Please enter your embeddings
              </Form.Message>
            </Form.Field>

            <Form.Field name="model">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <Form.Label className="data-[invalid]:label-invalid">
                  Model{" "}
                  <span className="font-medium text-destructive">*</span>
                </Form.Label>
              </div>
              <Form.Control asChild>
                <InputComponent
                  setSelectedOption={(e) => {
                    console.log("88888 model: ", e);
                    setModel(e);
                    inputState.model = e;
                  }}
                  selectedOption={model}
                  password={false}
                  options={["Qwen2", "llamma3"]}
                  placeholder="Choose a type for the variable..."
                  id={"type-global-variables"}
                ></InputComponent>
              </Form.Control>
              <Form.Message match="valueMissing" className="field-invalid">
                Please enter your Model
              </Form.Message>
            </Form.Field>
          </div>

          <div className="float-right">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
              className="mr-3"
            >
              {cancelText}
            </Button>

            <Form.Submit asChild>
              <Button className="mt-8">{confirmationText}</Button>
            </Form.Submit>
          </div>
        </Form.Root>
      </BaseModal.Content>
    </BaseModal>
  );
}

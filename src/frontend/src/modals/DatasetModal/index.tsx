import * as Form from "@radix-ui/react-form";
import { useContext, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import InputComponent from "../../components/inputComponent";
import IconComponent from "../../components/genericIconComponent";
import { CONTROL_NEW_USER } from "../../constants/constants";
import { AuthContext } from "../../contexts/authContext";
import useDatasetsManagerStore from "../../stores/datasetsManagerStore";
import {
  UserInputType,
  DatasetType,
  inputHandlerEventType,
} from "../../types/components";
import { nodeIconsLucide } from "../../utils/styleUtils";
import BaseModal from "../baseModal";

export default function DatasetModal({
  title,
  titleHeader,
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
  const uploadDatasets = useDatasetsManagerStore((state)=>state.uploadDatasets);
  const [model, setModel] = useState(data?.model ?? "");
  const [inputState, setInputState] = useState<UserInputType>(CONTROL_NEW_USER);
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
      handleInput({ target: { name: "document", value: documentname } });
      handleInput({ target: { name: "embeddings", value: embeddings } });
      handleInput({ target: { name: "model", value: model } });
    }
  }, [open]);

  function resetForm() {
    setEmbeddings("");
    setDocumentName("");
    setModel("");
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
            resetForm();
            onConfirm(1, inputState);
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
                    onChange={({ target: { value } }) => {
                      handleInput({ target: { name: "documentname", value } });
                      setDocumentName(value);
                    }}
                    value={documentname}
                    className="primary-input"
                    required
                    placeholder="LocalFile"
                  />
                </Form.Control>
                <Form.Message match="valueMissing" className="field-invalid">
                  Select your documentname
                </Form.Message>
                <Button
                  variant="primary"
                  onClick={() => {
                    uploadDatasets();
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
                    setEmbeddings(e);
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
                    setModel(e);
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

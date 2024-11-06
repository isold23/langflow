import * as Form from "@radix-ui/react-form";
import { Eye, EyeOff } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { CONTROL_NEW_KNOWLEDGE } from "../../constants/constants";
import { AuthContext } from "../../contexts/authContext";
import {
  KnowledgeInputType,
  KnowledgeManagementType,
  inputHandlerEventType,
} from "../../types/components";
import { nodeIconsLucide } from "../../utils/styleUtils";
import BaseModal from "../baseModal";

export default function KnowledgeModal({
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
}: KnowledgeManagementType) {
  const Icon: any = nodeIconsLucide[icon];
  const [pwdVisible, setPwdVisible] = useState(false);
  const [confirmPwdVisible, setConfirmPwdVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState(data?.password ?? "");
  const [name, setKnowledgeName] = useState(data?.name ?? "");
  const [usergroup, setUserGroup] = useState(data?.usergroup ?? "");
  const [userrole, setUserRole] = useState(data?.userrole ?? 1);
  const [confirmPassword, setConfirmPassword] = useState(data?.password ?? "");
  const [isActive, setIsActive] = useState(data?.is_active ?? false);
  const [isSuperUser, setIsSuperUser] = useState(data?.is_superuser ?? false);
  const [inputState, setInputState] = useState<KnowledgeInputType>(CONTROL_NEW_KNOWLEDGE);
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
      console.log("knowlendge data: ", data, "index: ", index, "name: ", name);
      handleInput({ target: { name: "name", value: name } });
    }
  }, [open]);

  function resetForm() {
    setKnowledgeName("");
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

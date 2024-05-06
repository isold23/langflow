import { Group, ToyBrick } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DropdownButton from "../../components/DropdownButtonComponent";
import IconComponent from "../../components/genericIconComponent";
import PageLayout from "../../components/pageLayout";
import SidebarNav from "../../components/sidebarComponent";
import { Button } from "../../components/ui/button";
import { CONSOLE_ERROR_MSG } from "../../constants/alerts_constants";
import {
  KNOWLEDGE_ADD_ERROR_ALERT,
  KNOWLEDGE_ADD_SUCCESS_ALERT,
} from "../../constants/alerts_constants";
import {
  KNOWLEDGE_LIBRARY_TITLE,
  KNOWLEDGE_LIBRARY_DESC,
} from "../../constants/constants";
import NewFlowModal from "../../modals/NewFlowModal";
import useAlertStore from "../../stores/alertStore";
import useFlowsManagerStore from "../../stores/flowsManagerStore";
import { downloadFlows } from "../../utils/reactflowUtils";
import KnowledgeModal from "../../modals/KnowledgeModal";
import { addKnowledge, updateKnowledge } from "../../controllers/API";

import { Knowledges } from "../../types/api";
import { KnowledgeInputType } from "../../types/components";

export default function KnowledgePage(): JSX.Element {
  const uploadFlow = useFlowsManagerStore((state) => state.uploadFlow);
  const setCurrentFlowId = useFlowsManagerStore(
    (state) => state.setCurrentFlowId
  );
  const uploadFlows = useFlowsManagerStore((state) => state.uploadFlows);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const location = useLocation();
  const pathname = location.pathname;
  const [openModal, setOpenModal] = useState(false);
  const is_component = pathname === "/components";
  const dropdownOptions = [
    {
      name: "Import from JSON",
      onBtnClick: () => {
        uploadFlow({
          newProject: true,
          isComponent: is_component,
        })
          .then((id) => {
            setSuccessData({
              title: `${is_component ? "Component" : "Flow"
                } uploaded successfully`,
            });
            if (!is_component) navigate("/flow/" + id);
          })
          .catch((error) => {
            setErrorData({
              title: CONSOLE_ERROR_MSG,
              list: [error],
            });
          });
      },
    },
  ];
  const sidebarNavItems = [
    {
      title: "Flows",
      href: "/flows",
      icon: <Group className="w-5 stroke-[1.5]" />,
    },
    {
      title: "Components",
      href: "/components",
      icon: <ToyBrick className="mx-[0.08rem] w-[1.1rem] stroke-[1.5]" />,
    },
  ];

  // Set a null id
  useEffect(() => {
    setCurrentFlowId("");
  }, [pathname]);

  const navigate = useNavigate();

  function handleNewKnowledge(knowledge: KnowledgeInputType ) {
    addKnowledge(knowledge)
      .then((res) => {
        updateKnowledge(res["id"], {
          knowledgename: knowledge.knowledgename,
        }).then((res) => {
          setSuccessData({
            title: KNOWLEDGE_ADD_SUCCESS_ALERT,
          });
        });
      })
      .catch((error) => {
        setErrorData({
          title: KNOWLEDGE_ADD_ERROR_ALERT,
          list: [error.response.data.detail],
        });
      });
  }

  // Personal flows display
  return (
    <PageLayout
      title={KNOWLEDGE_LIBRARY_TITLE}
      description={KNOWLEDGE_LIBRARY_DESC}
      button={
        <div>
          <KnowledgeModal
            title="New Knowledge Library"
            titleHeader={"Add a new knowledge library"}
            cancelText="Cancel"
            confirmationText="Save"
            icon={"UserPlus2"}
            onConfirm={(index, knowledge) => {
              handleNewKnowledge(knowledge);
            }}
            asChild
          >

            <Button variant="primary">
              <IconComponent name="Plus" className="main-page-nav-button" />
              New Knowledge
            </Button>
          </KnowledgeModal>
        </div>
      }
    >
      <div className="flex h-full w-full space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <div className="h-full w-full flex-1">
          <Outlet />
        </div>
      </div>

    </PageLayout>
  );
}

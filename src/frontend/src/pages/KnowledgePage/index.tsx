import { Group, ToyBrick } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DropdownButton from "../../components/DropdownButtonComponent";
import IconComponent from "../../components/genericIconComponent";
import PageLayout from "../../components/pageLayout";
import SidebarNav from "../../components/sidebarComponent";
import { Button } from "../../components/ui/button";
import { CONSOLE_ERROR_MSG } from "../../constants/alerts_constants";
import KnowledgeComponentsComponent from "../KnowledgePage/components/components";
import KnowledgeConfigComponent from "./components/knowledgeconfig";
import KnowledgeDatasetComponent from "./components/dataset";
import {
  KNOWLEDGE_ADD_ERROR_ALERT,
  KNOWLEDGE_ADD_SUCCESS_ALERT,
} from "../../constants/alerts_constants"
import {
  KNOWLEDGE_LIBRARY_TITLE,
  KNOWLEDGE_LIBRARY_DESC,
} from "../../constants/constants";
import useAlertStore from "../../stores/alertStore";
import useKnowledgesManagerStore from "../../stores/knowledgesManagerStore";
import KnowledgeModal from "../../modals/KnowledgeModal";
import { addKnowledge, updateKnowledge } from "../../controllers/API";

import { Knowledges } from "../../types/api";
import { KnowledgeInputType } from "../../types/components";

export default function KnowledgePage(): JSX.Element {
  const currentKnowledge = useKnowledgesManagerStore((state) => state.currentKnowledge);
  const uploadKnowledge = useKnowledgesManagerStore((state) => state.uploadKnowledge);
  const setCurrentKnowledgeId = useKnowledgesManagerStore(
    (state) => state.setCurrentKnowledgeId
  );
  const uploadKnowledges = useKnowledgesManagerStore((state) => state.uploadKnowledges);
  const refreshKnowledges = useKnowledgesManagerStore((state) => state.refreshKnowledges);
  const setIsLoading = useKnowledgesManagerStore((state) => state.setIsLoading);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const location = useLocation();
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);

  // Set a null id
  useEffect(() => {
    setCurrentKnowledgeId(id!);
  }, [id]);

  const navigate = useNavigate();

  function handleNewKnowledge(knowledge: KnowledgeInputType ) {
    addKnowledge(knowledge)
      .then((res) => {
        updateKnowledge(res["id"], {
          name: knowledge.name,
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

  const sidebarNavItems = [
    {
      title: "Config",
      href: "/knowledge/"+[currentKnowledge?.id]+"/knowledgeconfig",
      icon: <Group className="w-5 stroke-[1.5]" />,
    },
    {
      title: "Dataset",
      href: "/knowledge/"+[currentKnowledge?.id]+"/dataset",
      icon: <ToyBrick className="mx-[0.08rem] w-[1.1rem] stroke-[1.5]" />,
    },
  ];

  console.log("----------KnowledgePage-------- id: ", currentKnowledge?.id, " name: ", currentKnowledge?.name);
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
              setIsLoading(true);
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
        <aside className="flex h-full flex-col space-y-6 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="h-full w-full flex-1">
          <Outlet />
        </div>
      </div>
    </PageLayout>
  );
}

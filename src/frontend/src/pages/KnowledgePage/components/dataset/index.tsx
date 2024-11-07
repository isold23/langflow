import { cloneDeep } from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import PaginatorComponent from "../../../../components/PaginatorComponent";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import IconComponent from "../../../../components/genericIconComponent";
import Header from "../../../../components/headerComponent";
import LoadingComponent from "../../../../components/loadingComponent";
import { Button } from "../../../../components/ui/button";
import { CheckBoxDiv } from "../../../../components/ui/checkbox";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  USER_ADD_ERROR_ALERT,
  USER_ADD_SUCCESS_ALERT,
  USER_DEL_ERROR_ALERT,
  USER_DEL_SUCCESS_ALERT,
  USER_EDIT_ERROR_ALERT,
  USER_EDIT_SUCCESS_ALERT,
} from "../../../../constants/alerts_constants";
import {
  DATASET_HEADER_DESCRIPTION,
  DATASET_HEADER_TITLE,
} from "../../../../constants/constants";
import { AuthContext } from "../../../../contexts/authContext";
import {
  addUser,
  addDataset,
  deleteUser,
  getUsersPage,
  getDatasetsPage,
  updateUser,
  updateDataset,
} from "../../../../controllers/API";
import ConfirmationModal from "../../../../modals/ConfirmationModal";
import DatasetModal from "../../../../modals/DatasetModal";
import useAlertStore from "../../../../stores/alertStore";
import { Users } from "../../../../types/api";
import { DatasetInputType } from "../../../../types/components";
import useKnowledgesManagerStore from "../../../../stores/knowledgesManagerStore";
import { User } from "lucide-react";

export default function KnowledgeDatasetComponent() {
  const currentKnowledge = useKnowledgesManagerStore((state) => state.currentKnowledge);
  //const [inputValue, setInputValue] = useState("");
  const [size, setPageSize] = useState(10);
  const [index, setPageIndex] = useState(1);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const { userData } = useContext(AuthContext);
  const [totalRowsCount, setTotalRowsCount] = useState(0);
  const [name, setKnowledgeName] = useState(currentKnowledge?.name ?? "");
  const [id, setKnowledgeID] = useState(currentKnowledge?.id ?? "");

  const [open, setOpen] = useState(false);

  // set null id
  useEffect(() => {
    
  }, [open]);

  const datasetList = useRef([]);

  useEffect(() => {
    setTimeout(() => {
      getDatasets();
    }, 500);
  }, []);

  const [filterDatasetList, setFilterDatasetList] = useState(datasetList.current);

  function getDatasets() {
    setLoadingDatasets(true);
    getDatasetsPage(index - 1, size)
      .then((datasets) => {
        console.log("getDatasetsPage datasets: ", datasets);
        setTotalRowsCount(datasets["total_count"]);
        datasetList.current = datasets["datasets"];
        setFilterDatasetList(datasets["datasets"]);
        setLoadingDatasets(false);
      })
      .catch((error) => {
        setLoadingDatasets(false);
      });
  }

  function handleChangePagination(pageIndex: number, pageSize: number) {
    setLoadingDatasets(true);
    setPageSize(pageSize);
    setPageIndex(pageIndex);
    getUsersPage(pageSize * (pageIndex - 1), pageSize)
      .then((datasets) => {
        setTotalRowsCount(datasets["total_count"]);
        datasetList.current = datasets["users"];
        setFilterDatasetList(datasets["users"]);
        setLoadingDatasets(false);
      })
      .catch((error) => {
        setLoadingDatasets(false);
      });
  }

  function resetFilter() {
    setPageIndex(1);
    setPageSize(10);
    getDatasets();
  }

  // function handleFilterUsers(input: string) {
  //   setInputValue(input);

  //   if (input === "") {
  //     setFilterUserList(userList.current);
  //   } else {
  //     const filteredList = userList.current.filter((user: Users) =>
  //       user.username.toLowerCase().includes(input.toLowerCase())
  //     );
  //     setFilterUserList(filteredList);
  //   }
  // }

  function handleDeleteUser(user) {
    deleteUser(user.id)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: USER_DEL_SUCCESS_ALERT,
        });
      })
      .catch((error) => {
        setErrorData({
          title: USER_DEL_ERROR_ALERT,
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleEditUser(userId, user) {
    updateUser(userId, user)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: USER_EDIT_SUCCESS_ALERT,
        });
      })
      .catch((error) => {
        setErrorData({
          title: USER_EDIT_ERROR_ALERT,
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleDisableUser(check, userId, user) {
    const userEdit = cloneDeep(user);
    userEdit.is_active = !check;

    updateUser(userId, userEdit)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: USER_EDIT_SUCCESS_ALERT,
        });
      })
      .catch((error) => {
        setErrorData({
          title: USER_EDIT_ERROR_ALERT,
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleSuperUserEdit(check, userId, user) {
    const userEdit = cloneDeep(user);
    userEdit.is_superuser = !check;
    updateUser(userId, userEdit)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: USER_EDIT_SUCCESS_ALERT,
        });
      })
      .catch((error) => {
        setErrorData({
          title: USER_EDIT_ERROR_ALERT,
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleNewDataset(dataset: DatasetInputType) {
    console.log("handNewDataset----------------", dataset)
    addDataset(dataset)
      .then((res) => {
        updateDataset(res["id"], {
          is_active: dataset.is_active,
          is_superuser: dataset.is_superuser,
        }).then((res) => {
          resetFilter();
          setSuccessData({
            title: USER_ADD_SUCCESS_ALERT,
          });
        });
      })
      .catch((error) => {
        setErrorData({
          title: USER_ADD_ERROR_ALERT,
          list: [error.response.data.detail],
        });
      });
  }

  console.log("3333 userid: ", userData?.id, "knowledgeId:", id);

  return (
    <div className="flex h-full w-full flex-col justify-between">
        <div className="flex w-full flex-col gap-4">
      {userData && (
        <div className="admin-page-panel flex h-full flex-col pb-8">
          <div className="main-page-nav-arrangement">
            <span className="main-page-nav-title">
              <IconComponent name="Shield" className="w-6" />
              {DATASET_HEADER_TITLE} - { name }
            </span>
          </div>
          <span className="admin-page-description-text">
            {DATASET_HEADER_DESCRIPTION}
          </span>
          <div className="flex w-full justify-between px-4">
            <div>
              <DatasetModal
                title="New Dataset"
                titleHeader={"Add a new dataset"}
                userId={userData?.id}
                knowledgeId={id}
                cancelText="Cancel"
                confirmationText="Save"
                icon={"UserPlus2"}
                onConfirm={(index, dataset) => {
                  console.log("--------dataset: ", dataset);
                  handleNewDataset(dataset);
                }
              }
                asChild
              >
                <Button variant="primary">New Dataset</Button>
              </DatasetModal>
            </div>
          </div>
          {loadingDatasets ? (
            <div className="flex h-full w-full items-center justify-center">
              <LoadingComponent remSize={12} />
            </div>
          ) : datasetList.current.length === 0 ? (
            <>
              <div className="m-4 flex items-center justify-between text-sm">
                No users registered.
              </div>
            </>
          ) : (
            <>
              <div
                className={
                  "m-4 h-full overflow-x-hidden overflow-y-scroll rounded-md border-2 bg-background custom-scroll" +
                  (loadingDatasets ? " border-0" : "")
                }
              >
                <Table className={"table-fixed outline-1 "}>
                  <TableHeader
                    className={
                      loadingDatasets ? "hidden" : "table-fixed bg-muted outline-1"
                    }
                  >
                    <TableRow>
                      <TableHead className="h-10">Id</TableHead>
                      <TableHead className="h-10">UserId</TableHead>
                      <TableHead className="h-10">UserGroup</TableHead>
                      <TableHead className="h-10">KnowledgeId</TableHead>
                      <TableHead className="h-10">Documentname</TableHead>
                      <TableHead className="h-10">Model</TableHead>
                      <TableHead className="h-10">Embeddings</TableHead>
                      <TableHead className="h-10">Updated</TableHead>
                      <TableHead className="h-10 w-[100px]  text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  {!loadingDatasets && (
                    <TableBody>
                      {filterDatasetList.map((dataset: DatasetInputType, index) => (
                        <TableRow key={index}>
                          <TableCell className="truncate py-2 font-medium">
                            <ShadTooltip content={dataset.id}>
                              <span className="cursor-default">{dataset.id}</span>
                            </ShadTooltip>
                          </TableCell>
                          <TableCell className="truncate py-2">
                            <ShadTooltip content={dataset.user_id}>
                              <span className="cursor-default">
                                {dataset.user_id}
                              </span>
                            </ShadTooltip>
                          </TableCell>
                          <TableCell className="truncate py-2">
                            <ShadTooltip content={dataset.usergroup}>
                              <span className="cursor-default">
                                {dataset.usergroup}
                              </span>
                            </ShadTooltip>
                          </TableCell>
                          <TableCell className="truncate py-2">
                            <ShadTooltip content={dataset.knowledge_id}>
                              <span className="cursor-default">
                                {dataset.knowledge_id}
                              </span>
                            </ShadTooltip>
                          </TableCell>
                          <TableCell className="truncate py-2">
                            <ShadTooltip content={dataset.model}>
                              <span className="cursor-default">
                                {dataset.model}
                              </span>
                            </ShadTooltip>
                          </TableCell>
                          <TableCell className="truncate py-2">
                            <ShadTooltip content={dataset.embeddings}>
                              <span className="cursor-default">
                                {dataset.embeddings}
                              </span>
                            </ShadTooltip>
                          </TableCell>
                          <TableCell className="truncate py-2">
                            {
                              dataset.updated_at
                            }
                          </TableCell>
                          <TableCell className="flex w-[100px] py-2 text-right">
                            <div className="flex">
                              <DatasetModal
                                title="Edit"
                                titleHeader={`${dataset.id}`}
                                userId={`${dataset.id}`}
                                knowledgeId={id}
                                cancelText="Cancel"
                                confirmationText="Save"
                                icon={"UserPlus2"}
                                data={dataset}
                                index={index}
                                onConfirm={(index, editUser) => {
                                  handleEditUser(dataset.id, editUser);
                                }}
                              >
                                <ShadTooltip content="Edit" side="top">
                                  <IconComponent
                                    name="Pencil"
                                    className="h-4 w-4 cursor-pointer"
                                  />
                                </ShadTooltip>
                              </DatasetModal>

                              <ConfirmationModal
                                size="x-small"
                                title="Delete"
                                titleHeader="Delete User"
                                modalContentTitle="Attention!"
                                cancelText="Cancel"
                                confirmationText="Delete"
                                icon={"UserMinus2"}
                                data={dataset}
                                index={index}
                                onConfirm={(index, dataset) => {
                                  handleDeleteUser(dataset);
                                }}
                              >
                                <ConfirmationModal.Content>
                                  <span>
                                    Are you sure you want to delete this user?
                                    This action cannot be undone.
                                  </span>
                                </ConfirmationModal.Content>
                                <ConfirmationModal.Trigger>
                                  <IconComponent
                                    name="Trash2"
                                    className="ml-2 h-4 w-4 cursor-pointer"
                                  />
                                </ConfirmationModal.Trigger>
                              </ConfirmationModal>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </div>

              <PaginatorComponent
                pageIndex={index}
                pageSize={size}
                totalRowsCount={totalRowsCount}
                paginate={(pageSize, pageIndex) => {
                  handleChangePagination(pageIndex, pageSize);
                }}
              ></PaginatorComponent>
            </>
          )}
        </div>
      )}
  </div>
  </div>);
}
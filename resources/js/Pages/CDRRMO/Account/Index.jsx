import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Trash2,
    SquarePlus,
    Pencil,
    CircleUser,
    KeyRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { Toaster, toast } from "sonner";
import DynamicTable from "@/Components/DynamicTable";
import ActionMenu from "@/Components/ActionMenu";
import SidebarModal from "@/Components/SidebarModal";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import { Switch } from "@/Components/ui/switch";
import ResetPasswordModal from "./Partials/ResetPasswordModal";
import AccountDetailsModal from "./Partials/AccountDetailsModal";

export default function Index({ accounts, queryParams, barangays }) {
    const breadcrumbs = [
        { label: "Barangay Information", showOnMobile: false },
        { label: "Accounts", showOnMobile: true },
    ];
    queryParams = queryParams || {};
    const APP_URL = useAppUrl();
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [accountDetails, setAccountDetails] = useState(null); //delete
    const [recordToDelete, setRecordToDelete] = useState(null); //delete

    const [query, setQuery] = useState(queryParams["name"] ?? "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalState, setModalState] = useState("");
    const [selectedResident, setSelectedResident] = useState(null);
    const [passwordError, setPasswordError] = useState("");

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        searchFieldName("name", query);
    };
    const searchFieldName = (field, value) => {
        if (value && value.trim() !== "") {
            queryParams[field] = value;
        } else {
            delete queryParams[field];
        }

        if (queryParams.page) {
            delete queryParams.page;
        }
        router.get(route("cdrrmo_admin.accounts", queryParams));
    };
    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") {
            searchFieldName(field, e.target.value);
        } else {
            return;
        }
    };

    // password reset
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const handleOpenResetPassword = (user) => {
        setSelectedUser(user);
        setIsResetPasswordOpen(true);
    };

    const allColumns = [
        { key: "id", label: "ID" },
        { key: "barangay", label: "Barangay" },
        { key: "name", label: "User Name" },
        { key: "email", label: "Email" },
        { key: "status", label: "Session Status" },
        { key: "account_status", label: "Account Status" },
        { key: "logged_in", label: "Last Logged In" },
        { key: "created_at", label: "Date Added" },
        { key: "actions", label: "Actions" },
    ];

    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            ["session_status", "account_status"].includes(key) &&
            value &&
            value !== "",
    );
    useEffect(() => {
        if (hasActiveFilter) {
            setShowFilters(true);
        }
    }, [hasActiveFilter]);

    const [showFilters, setShowFilters] = useState(hasActiveFilter);
    const toggleShowFilters = () => setShowFilters((prev) => !prev);
    const [isPaginated, setIsPaginated] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [accountEnabledMap, setAccountEnabledMap] = useState(
        accounts.data.reduce((acc, a) => {
            acc[a.id] = !a.is_disabled; // initial state
            return acc;
        }, {}),
    );

    const columnRenderers = {
        id: (row) => (
            <span className="text-xs text-gray-500 font-medium">{row.id}</span>
        ),

        barangay: (row) => {
            const r = row.barangay.barangay_name ?? {};
            return (
                <span className="text-sm font-semibold text-gray-800">
                    {r || "—"}
                </span>
            );
        },

        name: (row) => (
            <span className="text-sm font-medium text-gray-800">
                {row.username ?? "—"}
            </span>
        ),

        email: (row) => (
            <span className="text-xs text-gray-600">{row.email ?? "—"}</span>
        ),

        role: (row) => (
            <span
                className={`text-xs font-medium ${
                    row.role === "barangay_officer"
                        ? "text-indigo-600"
                        : row.role === "resident"
                          ? "text-green-600"
                          : "text-gray-400"
                }`}
            >
                {ACCOUNT_ROLE_TEXT[row.role] ?? "—"}
            </span>
        ),

        status: (row) => {
            const isActive = row.status === "active";

            return (
                <span
                    className={`
                    text-xs font-semibold px-3 py-1 rounded-full transition
                    ${
                        isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }
                    hover:shadow-sm
                `}
                >
                    {row.status?.toUpperCase() ?? "—"}
                </span>
            );
        },

        logged_in: (row) => {
            const date = row.updated_at
                ? new Date(row.updated_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                  })
                : "—";

            return <span className="text-xs text-gray-500">{date}</span>;
        },

        account_status: (row) => {
            const enabled = accountEnabledMap[row.id] ?? true;

            const handleToggle = (checked) => {
                setAccountEnabledMap((prev) => ({
                    ...prev,
                    [row.id]: checked,
                }));

                axios
                    .patch(`/user/${row.id}/toggle-account`, {
                        is_disabled: checked ? 0 : 1, // if switch is checked → enabled → not disabled
                    })
                    .then((res) => {
                        if (res.data.success) {
                            toast.success(res.data.message, {
                                duration: 3000,
                                closeButton: true,
                            });
                        } else {
                            toast.error(
                                res.data.message || "Something went wrong.",
                                {
                                    duration: 3000,
                                    closeButton: true,
                                },
                            );
                        }
                    })
                    .catch(() => {
                        // fallback for unexpected errors
                        toast.error("Failed to update account status.", {
                            duration: 3000,
                            closeButton: true,
                        });

                        // revert toggle on error
                        setAccountEnabledMap((prev) => ({
                            ...prev,
                            [row.id]: !checked,
                        }));
                    });
            };

            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={enabled}
                        onCheckedChange={handleToggle}
                        className="bg-gray-200 hover:bg-gray-300"
                    />
                    <span
                        className={`text-xs font-semibold ${
                            enabled ? "text-green-700" : "text-red-700"
                        }`}
                    >
                        {enabled ? "ENABLED" : "DISABLED"}
                    </span>
                </div>
            );
        },

        created_at: (row) => {
            const date = row.created_at
                ? new Date(row.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                  })
                : "—";

            return <span className="text-xs text-gray-500">{date}</span>;
        },

        actions: (row) => (
            <ActionMenu
                actions={[
                    {
                        label: "Edit",
                        icon: <Pencil className="w-4 h-4 text-blue-600" />,
                        onClick: () => handleEdit(row.id),
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(row.id),
                    },
                    {
                        label: "Reset Password",
                        icon: <KeyRound className="w-4 h-4 text-amber-600" />,
                        onClick: () => handleOpenResetPassword(row),
                    },
                ]}
            />
        ),
    };

    const { data, setData, post, errors, reset, clearErrors } = useForm({
        barangay_id: null,
        barangay_name: "",

        // Account fields
        username: "",
        email: "",
        password: "",
        password_confirmation: "",

        // Optional admin controls
        status: "inactive", // default active
        is_disabled: false,
        account_id: null,
        _method: undefined,
    });
    const defaultVisibleCols = allColumns.map((col) => col.key);
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem("accounts_visible_columns");
        return saved ? JSON.parse(saved) : defaultVisibleCols;
    });
    useEffect(() => {
        localStorage.setItem(
            "accounts_visible_columns",
            JSON.stringify(visibleColumns),
        );
    }, [visibleColumns]);
    const barangaysList = barangays.map((b) => ({
        label: b.barangay_name,
        value: b.id.toString(), // ensure string for dropdown compatibility
    }));
    const handleBarangayChange = (value) => {
        const selectedBarangay = barangaysList.find(
            (b) => b.value.toString() == value.target.value,
        );

        if (selectedBarangay) {
            setData("barangay_id", selectedBarangay.value);
            setData("barangay_name", selectedBarangay.label); // store name for display
        } else {
            setData("barangay_id", "");
            setData("barangay_name", value.target.value);
        }
    };
    const handleModalClose = () => {
        setModalState(null);
        setIsModalOpen(false);
        setSelectedResident(null);
        setAccountDetails(null);
        reset();
        clearErrors();
    };

    const handleAddAccount = () => {
        setModalState("add");
        setIsModalOpen(true);
    };
    const handleAddAccountSubmit = (e) => {
        e.preventDefault();
        post(route("cdrrmo_admin.account.store"));
    };

    const handleEdit = async (accountId) => {
        try {
            const res = await axios.get(
                `${APP_URL}/cdrrmo_admin/details/${accountId}`,
            );
            console.log(res);
            const account = res.data;

            setModalState("edit");
            setIsModalOpen(true);

            // Populate form data
            setData({
                barangay_id: account.barangay_id,
                barangay_name: account.barangay_name || "", // top-level field
                username: account.username,
                email: account.email,
                originalEmail: account.email,
                password: "",
                password_confirmation: "",
                account_id: account.id, // needed for update
                _method: "PUT",
            });
        } catch (error) {
            console.error("Error fetching account details:", error);
            toast.error("Failed to fetch account details.");
        }
    };

    const handleEditAccountSubmit = (e) => {
        e.preventDefault();

        if (!data.account_id) return; // safety check

        post(route("cdrrmo_admin.account.update", data.account_id), {
            onError: (errors) => {
                const errorList = Object.values(errors).map(
                    (msg, i) => `<div key=${i}>${msg}</div>`,
                );

                toast.error("Validation Error", {
                    description: (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: errorList.join(""),
                            }}
                        />
                    ),
                    duration: 4000,
                    closeButton: true,
                });
            },
        });
    };
    // delete
    const handleDeleteClick = (id) => {
        setRecordToDelete(id);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        router.delete(route("user.destroy", recordToDelete));
        setIsDeleteModalOpen(false);
    };
    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        if (success) {
            handleModalClose();
            toast.success(success, {
                description: "Operation successful!",
                duration: 3000,
                closeButton: true,
            });
        }
        props.success = null;
    }, [success]);
    useEffect(() => {
        if (error) {
            toast.error(error, {
                description: "Operation failed!",
                duration: 3000,
                closeButton: true,
            });
            handleModalClose();
        }
        props.error = null;
    }, [error]);

    return (
        <AdminLayout>
            <Head title="Account Information" />
            <div>
                <Toaster richColors />
                <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
                {/* <pre>{JSON.stringify(accounts, undefined, 2)}</pre> */}
                <div className="p-2 md:p-4">
                    <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                            <div className="mb-6">
                                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl shadow-sm">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                                        <CircleUser className="w-6 h-6 text-blue-600" />
                                    </div>

                                    {/* Header Text */}
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                            Barangay Accounts
                                        </h1>
                                        <p className="mt-1 md:mt-2 text-gray-600 text-sm md:text-base">
                                            Manage and monitor{" "}
                                            <span className="font-medium text-gray-800">
                                                barangay accounts
                                            </span>{" "}
                                            within the system. Use the tools
                                            below to{" "}
                                            <span className="font-medium text-gray-800">
                                                create, update, filter, or
                                                export
                                            </span>{" "}
                                            account information for
                                            administrative purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-start justify-between gap-2 w-full mb-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <DynamicTableControls
                                        allColumns={allColumns}
                                        visibleColumns={visibleColumns}
                                        setVisibleColumns={setVisibleColumns}
                                        onPrint={handlePrint}
                                        showFilters={showFilters}
                                        toggleShowFilters={() =>
                                            setShowFilters((prev) => !prev)
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    <form
                                        onSubmit={handleSearchSubmit}
                                        className="flex w-[380px] max-w-lg items-center space-x-1"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Search Resident Name"
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                onKeyPressed(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full"
                                        />
                                        <div className="relative group z-50">
                                            <Button
                                                type="submit"
                                                className="border active:bg-blue-900 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center gap-2 bg-transparent"
                                                variant="outline"
                                            >
                                                <Search />
                                            </Button>
                                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                Search
                                            </div>
                                        </div>
                                        <div className="relative group z-50">
                                            <Button
                                                className="bg-blue-700 hover:bg-blue-400 "
                                                type={"button"}
                                                onClick={handleAddAccount}
                                            >
                                                <SquarePlus />
                                            </Button>
                                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                Add Account
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            {showFilters && (
                                <FilterToggle
                                    queryParams={queryParams}
                                    searchFieldName={searchFieldName}
                                    visibleFilters={[
                                        "session_status",
                                        "account_status",
                                    ]}
                                    showFilters={true}
                                    clearRouteName="super_admin.accounts"
                                    clearRouteParams={{}}
                                />
                            )}
                            <DynamicTable
                                passedData={accounts}
                                allColumns={allColumns}
                                columnRenderers={columnRenderers}
                                queryParams={queryParams}
                                is_paginated={isPaginated}
                                toggleShowAll={() => setShowAll(!showAll)}
                                showAll={showAll}
                                visibleColumns={visibleColumns}
                            />
                        </div>
                    </div>
                </div>
                <AccountDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    modalState={modalState}
                    accountDetails={accountDetails}
                    data={data}
                    setData={setData}
                    errors={errors}
                    barangaysList={barangaysList}
                    handleBarangayChange={handleBarangayChange}
                    handleAddAccountSubmit={handleAddAccountSubmit}
                    handleEditAccountSubmit={handleEditAccountSubmit}
                    passwordError={passwordError}
                />
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                    }}
                    onConfirm={confirmDelete}
                    residentId={recordToDelete}
                />
                <ResetPasswordModal
                    open={isResetPasswordOpen}
                    onClose={() => {
                        setIsResetPasswordOpen(false);
                        setSelectedUser(null);
                    }}
                    selectedUser={selectedUser}
                />
            </div>
        </AdminLayout>
    );
}

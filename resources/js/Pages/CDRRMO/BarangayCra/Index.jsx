import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Activity, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { Toaster, toast } from "sonner";
import DynamicTable from "@/Components/DynamicTable";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import useAppUrl from "@/hooks/useAppUrl";
import { getProgressStatus } from "@/constants";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";

export default function Index({ barangays, queryParams }) {
    const breadcrumbs = [{ label: "Barangay CRA", showOnMobile: true }];

    queryParams = queryParams || {};

    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const [query, setQuery] = useState(queryParams["search"] ?? "");
    const [visibleColumns, setVisibleColumns] = useState([
        "barangay_name",
        "progress",
        "year",
        "status",
        "actions",
    ]);

    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            ["status_percentage", "year", "search"].includes(key) &&
            value &&
            value !== "" &&
            value !== "All",
    );

    const [showFilters, setShowFilters] = useState(hasActiveFilter);

    useEffect(() => {
        if (hasActiveFilter) {
            setShowFilters(true);
        }
    }, [hasActiveFilter]);

    const toggleShowFilters = () => setShowFilters((prev) => !prev);

    // ✅ SEARCH
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        searchField("search", query);
    };

    const searchField = (field, value) => {
        if (value) queryParams[field] = value;
        else delete queryParams[field];

        router.get(route("barangay-cra.index", queryParams));
    };
    const ViewButton = ({ progressId }) => {
        if (!progressId) {
            return (
                <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 text-gray-500 border border-gray-200 cursor-not-allowed select-none">
                    <Eye className="w-4 h-4" />
                    View
                </div>
            );
        }

        return (
            <Button
                size="sm"
                onClick={() =>
                    router.visit(route("barangay-cra.edit", progressId))
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 transition"
            >
                <Eye className="w-4 h-4" />
                Edit
            </Button>
        );
    };

    // ✅ TOASTS
    useEffect(() => {
        if (success) toast.success(success);
    }, [success]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const formatDate = (value) => {
        if (!value) return "No update yet";

        return new Date(value).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    // ✅ TABLE COLUMNS
    const allColumns = [
        { key: "barangay_name", label: "Barangay" },
        { key: "progress", label: "Progress" },
        { key: "year", label: "Year" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
    ];

    // ✅ RENDERERS
    const columnRenderers = {
        barangay_name: (row) => {
            return (
                <div className="min-w-[180px]">
                    <div className="truncate text-sm font-semibold text-slate-800">
                        {row.barangay_name}
                    </div>

                    <div className="text-[11px] text-slate-400">
                        ID: {row.id}
                    </div>
                </div>
            );
        },

        progress: (row) => {
            const percentage = parseFloat(row.latest_progress?.percentage || 0);
            const status = getProgressStatus(percentage);

            const submitted = row.latest_progress?.submitted_at;

            return (
                <div className="w-full min-w-[240px] max-w-[280px]">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">
                            Completion
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                            {percentage}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${status.bar}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    {/* Status + Description */}
                    <div className="mt-2 flex items-start justify-between gap-3">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.bg} ${status.color}`}
                        >
                            {status.short}
                        </span>

                        <span className="text-right text-[11px] leading-4 text-slate-500">
                            {status.description}
                        </span>
                    </div>

                    {/* NEW: Submitted Info */}
                    <div className="mt-2 text-[11px] text-slate-400">
                        {submitted
                            ? `Submitted: ${formatDate(submitted)}`
                            : "Not submitted yet"}
                    </div>
                </div>
            );
        },

        year: (row) => {
            const year =
                row.latest_progress?.community_risk_assessment?.year ||
                row.progress_list?.[0]?.year;

            const updatedAt = row.latest_progress?.updated_at;

            return (
                <div className="flex min-w-[140px] flex-col">
                    <span className="inline-flex w-fit items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {year || "N/A"}
                    </span>

                    <span className="mt-1 text-[11px] text-slate-400">
                        CRA Year
                    </span>

                    <span className="mt-2 text-[11px] leading-4 text-slate-500">
                        Updated: {formatDate(updatedAt)}
                    </span>
                </div>
            );
        },

        status: (row) => {
            const percentage = parseFloat(row.latest_progress?.percentage || 0);
            const status = getProgressStatus(percentage);

            const submitted = row.latest_progress?.submitted_at;

            return (
                <div className="flex min-w-[160px] flex-col gap-1">
                    <span
                        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}
                    >
                        {status.label}
                    </span>

                    <span className="text-[11px] text-slate-500">
                        {status.description}
                    </span>

                    {/* NEW */}
                    <span className="text-[11px] text-slate-400">
                        {submitted ? "Submitted" : "Draft"}
                    </span>
                </div>
            );
        },

        actions: (row) => {
            const progressId = row.latest_progress?.id;
            const percentage = parseFloat(row.latest_progress?.percentage || 0);
            const hasRecord = !!progressId;

            return (
                <div className="flex min-w-[160px] flex-col gap-2">
                    <ViewButton progressId={progressId} />

                    <span
                        className={`inline-flex w-fit rounded-md px-2 py-1 text-[11px] font-medium ${
                            hasRecord
                                ? "bg-slate-100 text-slate-700"
                                : "bg-rose-50 text-rose-600"
                        }`}
                    >
                        {hasRecord ? `${percentage}% saved` : "No CRA record"}
                    </span>
                </div>
            );
        },
    };

    return (
        <AdminLayout>
            <Head title="Barangay CRA" />

            <Toaster richColors />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />

            <div className="p-2 md:p-4">
                <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                    {/* <pre>{JSON.stringify(barangays, undefined, 2)}</pre> */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                        {/* HEADER */}
                        <div className="mb-4">
                            <div className="flex items-start gap-4 p-5 bg-green-50 rounded-xl shadow-sm border border-green-100">
                                <div className="p-3 bg-green-100 rounded-full shadow-sm">
                                    <Activity className="w-6 h-6 text-green-600" />
                                </div>

                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Barangay CRA Progress
                                    </h1>
                                    <p className="text-sm md:text-base text-gray-600 mt-1 leading-relaxed">
                                        Monitor and evaluate the{" "}
                                        <span className="font-medium text-gray-800">
                                            Community Risk Assessment (CRA)
                                        </span>{" "}
                                        completion of each barangay. Track
                                        progress and improve disaster risk
                                        reduction planning.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* TOTAL */}
                            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                                <p className="text-xs text-gray-500">
                                    Total Barangays
                                </p>
                                <h2 className="text-xl font-bold text-gray-800 mt-1">
                                    {barangays?.length || 0}
                                </h2>
                            </div>

                            {/* COMPLETED */}
                            <div className="bg-white border border-green-100 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                                <p className="text-xs text-gray-500">
                                    Completed
                                </p>
                                <h2 className="text-xl font-bold text-green-600 mt-1">
                                    {
                                        barangays.filter(
                                            (b) =>
                                                parseFloat(
                                                    b.latest_progress
                                                        ?.percentage || 0,
                                                ) === 100,
                                        ).length
                                    }
                                </h2>
                            </div>

                            {/* ONGOING */}
                            <div className="bg-white border border-yellow-100 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                                <p className="text-xs text-gray-500">Ongoing</p>
                                <h2 className="text-xl font-bold text-yellow-600 mt-1">
                                    {
                                        barangays.filter((b) => {
                                            const p = parseFloat(
                                                b.latest_progress?.percentage ||
                                                    0,
                                            );
                                            return p > 0 && p < 100;
                                        }).length
                                    }
                                </h2>
                            </div>

                            {/* NOT STARTED */}
                            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                                <p className="text-xs text-gray-500">
                                    Not Started
                                </p>
                                <h2 className="text-xl font-bold text-gray-500 mt-1">
                                    {
                                        barangays.filter(
                                            (b) =>
                                                !b.latest_progress ||
                                                parseFloat(
                                                    b.latest_progress
                                                        ?.percentage || 0,
                                                ) === 0,
                                        ).length
                                    }
                                </h2>
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="flex justify-between mb-2 flex-wrap gap-2">
                            <DynamicTableControls
                                allColumns={allColumns}
                                visibleColumns={visibleColumns}
                                setVisibleColumns={setVisibleColumns}
                                showFilters={showFilters}
                                toggleShowFilters={() =>
                                    setShowFilters(!showFilters)
                                }
                            />

                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex gap-2"
                            >
                                <Input
                                    placeholder="Search barangay..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <Button type="submit">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>

                        {/* TABLE */}
                        {showFilters && (
                            <FilterToggle
                                queryParams={queryParams}
                                visibleFilters={["status_percentage"]}
                                showFilters={true}
                                searchFieldName={searchField}
                                clearRouteName="barangay-cra.index"
                                clearRouteParams={{}}
                            />
                        )}
                        <DynamicTable
                            passedData={barangays}
                            allColumns={allColumns}
                            columnRenderers={columnRenderers}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            showTotal={true}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

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

    const [showFilters, setShowFilters] = useState(false);

    // ✅ SEARCH
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        searchField("search", query);
    };

    const searchField = (field, value) => {
        if (value) queryParams[field] = value;
        else delete queryParams[field];

        router.get(route("cdrrmo.barangay.cra.index", queryParams));
    };
    const ViewButton = ({ craId }) => {
        if (!craId) {
            return (
                <div
                    className="
                    flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md
                    bg-gray-200 text-gray-500 border border-gray-200
                    cursor-not-allowed select-none
                "
                >
                    <Eye className="w-4 h-4" />
                    View
                </div>
            );
        }

        return (
            <Button
                size="sm"
                onClick={() => router.visit(route("barangay-cra.show", craId))}
                className="
                flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md
                bg-blue-500 hover:bg-blue-600 text-white border border-blue-500
                transition
            "
            >
                <Eye className="w-4 h-4" />
                View
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
        barangay_name: (row) => (
            <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-sm">
                    {row.barangay_name}
                </span>
                <span className="text-xs text-gray-400">ID: {row.id}</span>
            </div>
        ),

        progress: (row) => {
            const percentage = parseFloat(row.latest_progress?.percentage || 0);

            return (
                <div className="flex flex-col gap-1 w-full max-w-[160px]">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                percentage === 100
                                    ? "bg-green-500"
                                    : percentage > 0
                                      ? "bg-yellow-500"
                                      : "bg-gray-400"
                            }`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    {/* Percentage */}
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>{percentage}%</span>
                        <span className="text-gray-400">
                            {percentage === 100
                                ? "Complete"
                                : percentage > 0
                                  ? "In Progress"
                                  : "No Data"}
                        </span>
                    </div>
                </div>
            );
        },

        year: (row) => {
            const year = row.latest_progress?.community_risk_assessment?.year;

            return (
                <div className="flex items-center">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
                        {year || "N/A"}
                    </span>
                </div>
            );
        },

        status: (row) => {
            const percentage = parseFloat(row.latest_progress?.percentage || 0);

            let status = "Not Started";
            let style = "bg-gray-100 text-gray-600 border border-gray-200";

            if (percentage === 100) {
                status = "Completed";
                style = "bg-green-50 text-green-700 border border-green-200";
            } else if (percentage > 0) {
                status = "Ongoing";
                style = "bg-yellow-50 text-yellow-700 border border-yellow-200";
            }

            return (
                <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${style}`}
                >
                    {status}
                </span>
            );
        },

        actions: (row) => {
            const craId = row.latest_progress?.cra_id;

            return (
                <div className="flex items-center">
                    <ViewButton craId={craId} />
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

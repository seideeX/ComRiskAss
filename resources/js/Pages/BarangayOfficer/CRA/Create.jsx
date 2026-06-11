import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import Stepper from "@/Components/Stepper";
import StepperController from "@/Components/StepperControler";
import { StepperContext } from "@/context/StepperContext";
import Population from "@/Components/CRAsteps/Population";
import { Toaster, toast } from "sonner";
import Hazard from "@/Components/CRAsteps/Step3/Hazard";
import Calamities from "@/Components/CRAsteps/Step2/Calamities";
import InventoryEvacuation from "@/Components/CRAsteps/Step4/InventoryEvacuation";
import DisasterReadiness from "@/Components/CRAsteps/Step5/DisasterReadiness";
import {
    defaultLivelihoods,
    defaultInfra,
    defaultBuildings,
    defaultFacilities,
} from "@/Components/CRAsteps/defaults";

// ADD THESE
import { dynamicMapper } from "@/services/dynamicMapper";
import { populationMapping } from "@/services/populationMapping";
import { livelihoodMapping } from "@/services/livelihoodMapping";
import { buildingFacilityMapping } from "@/services/buildingFacilityMapping";
import { institutionHumanMapping } from "@/services/institutionHumanMapping";
import { calamityMapping } from "@/services/calamityMapping";
import { hazardMapping } from "@/services/hazardMapping";
import { riskMapping } from "@/services/riskMapping";
import { exposureMapping } from "@/services/exposureMapping";
import { pwdMapping } from "@/services/pwdMapping";
import { familyRiskMapping } from "@/services/familyRiskMapping";
import { illnessesMapping } from "@/services/illnessesMapping";
import { disasterPerPurokMapping } from "@/services/disasterPerPurokMapping ";
import { disasterInventoryMapping } from "@/services/disasterInventoryMapping ";
import { evacuationListMapping } from "@/services/evacuationMapping";
import { evacuationCenterInventoryMapping } from "@/services/evacuationCenterInventoryMapping";
import { affectedAreasMapping } from "@/services/affectedAreasMapping";
import { livelihoodEvacuationMapping } from "@/services/livelihoodEvacuationMapping";
import { foodInventoryMapping } from "@/services/foodInventoryMapping";
import { reliefGoodsMapping } from "@/services/reliefGoodsMapping";
import { distributionProcessMapping } from "@/services/distributionProcessMapping";
import { trainingsInventoryMapping } from "@/services/trainingsInventoryMapping";
import { equipmentInventoryMapping } from "@/services/equipmentInventoryMapping";
import { bdrrmcDirectoryMapping } from "@/services/bdrrmcDirectoryMapping";
import { evacuationPlanMapping } from "@/services/evacuationPlanMapping";
import { getProgressStatus } from "@/constants";

function mapBackendCraToFrontend(serverData, selectedYear, defaults) {
    if (
        !serverData ||
        typeof serverData !== "object" ||
        Array.isArray(serverData)
    ) {
        return defaults;
    }

    return {
        ...defaults,

        // Step 1: A
        ...dynamicMapper(serverData, populationMapping),

        // Step B & C
        ...dynamicMapper(serverData, livelihoodMapping),

        // Step D & E
        ...dynamicMapper(serverData, buildingFacilityMapping),

        // Step F & G 🔥
        ...dynamicMapper(serverData, institutionHumanMapping),

        ...dynamicMapper(serverData, calamityMapping),
        ...dynamicMapper(serverData, hazardMapping),
        ...dynamicMapper(serverData, riskMapping),
        ...dynamicMapper(serverData, exposureMapping),
        ...dynamicMapper(serverData, pwdMapping),
        ...dynamicMapper(serverData, familyRiskMapping),
        ...dynamicMapper(serverData, illnessesMapping),
        ...dynamicMapper(serverData, disasterPerPurokMapping),
        ...dynamicMapper(serverData, disasterInventoryMapping),
        ...dynamicMapper(serverData, evacuationListMapping),
        ...dynamicMapper(serverData, evacuationCenterInventoryMapping),
        ...dynamicMapper(serverData, affectedAreasMapping),
        ...dynamicMapper(serverData, livelihoodEvacuationMapping),
        ...dynamicMapper(serverData, foodInventoryMapping),
        ...dynamicMapper(serverData, reliefGoodsMapping),
        ...dynamicMapper(serverData, distributionProcessMapping),
        ...dynamicMapper(serverData, trainingsInventoryMapping),
        ...dynamicMapper(serverData, equipmentInventoryMapping),
        ...dynamicMapper(serverData, bdrrmcDirectoryMapping),
        ...dynamicMapper(serverData, evacuationPlanMapping),

        year: serverData?.cra?.year ?? selectedYear,
    };
}

export default function Index({ progress, barangay_id }) {
    const breadcrumbs = [
        { label: "Community Risk Assessment (CRA)", showOnMobile: false },
    ];

    const { props } = usePage();
    const { success, error, craData: craDataFromServer } = props;
    //console.log(craDataFromServer);
    const steps = useMemo(
        () => [
            "Barangay Resource Profile",
            "Community Disaster History",
            "Barangay Risk Assessment",
            "Inventory & Evacuations",
            "Disaster Readiness",
        ],
        [],
    );

    const yearFromUrl = useMemo(() => {
        if (typeof window === "undefined") return "default";
        return (
            new URLSearchParams(window.location.search).get("year") || "default"
        );
    }, []);

    const [currentStep, setCurrentStep] = useState(1);
    const [year, setYear] = useState(yearFromUrl);
    const [finalData, setFinalData] = useState([]);
    const [errors, setErrors] = useState({});

    const percentage = Number(progress?.percentage ?? 0);
    const status = getProgressStatus(percentage);

    const getDefaultCraData = useCallback(
        (selectedYear) => ({
            population: [],
            calamities: [],

            livelihood: (defaultLivelihoods ?? []).map((type) => ({
                type,
                male_no_dis: "",
                male_dis: "",
                female_no_dis: "",
                female_dis: "",
                lgbtq_no_dis: "",
                lgbtq_dis: "",
            })),

            infrastructure: defaultInfra ?? [],
            institutions: [],
            human_resources: [],
            hazards: [],
            evacuation: [],

            buildings: structuredClone(defaultBuildings),
            facilities: structuredClone(defaultFacilities),

            risks: [],
            vulnerabilities: [],
            exposure: [],
            pwd: [],
            illnesses: [],
            family_at_risk: [],
            disaster_per_purok: [],
            disaster_inventory: [],
            evacuation_list: [],
            evacuation_center_inventory: [],
            livelihood_evacuation: [],
            food_inventory: [],
            relief_goods: [],
            distribution_process: [],
            trainings_inventory: [],
            equipment_inventory: [],
            bdrrmc_directory: [],
            evacuation_plan: [],
            affected_areas: [],

            year: selectedYear,
        }),
        [],
    );

    const buildCraData = useCallback(
        (selectedYear, serverData) => {
            const defaults = getDefaultCraData(selectedYear);

            return mapBackendCraToFrontend(serverData, selectedYear, defaults);
        },
        [getDefaultCraData],
    );

    const [craData, setCraData] = useState(() =>
        buildCraData(yearFromUrl, craDataFromServer),
    );

    // useEffect(() => {
    //     if (!year) return;
    //     setCraData(buildCraData(year, craDataFromServer));
    // }, [year, craDataFromServer, buildCraData]);
    useEffect(() => {
        if (!year) return;

        if (craDataFromServer) {
            setCraData((prev) => {
                // only initialize from server if local data is still basically empty
                if (prev && Object.keys(prev).length > 0) return prev;
                return buildCraData(year, craDataFromServer);
            });
        }
    }, [year, craDataFromServer, buildCraData]);

    const displayStep = useCallback((step) => {
        switch (step) {
            case 1:
                return <Population />;
            case 2:
                return <Calamities />;
            case 3:
                return <Hazard />;
            case 4:
                return <InventoryEvacuation />;
            case 5:
                return <DisasterReadiness />;
            default:
                return null;
        }
    }, []);

    const handleClick = useCallback(
        (direction) => {
            if (direction === "next") {
                if (currentStep === steps.length) {
                    router.post(
                        route("cra.store"),
                        { ...craData, barangay_id },
                        {
                            preserveState: true,
                            preserveScroll: true,

                            onSuccess: () => {
                                toast.success("CRA submitted successfully!");
                            },

                            onError: (formErrors) => {
                                setErrors(formErrors);
                                console.error("Validation Errors:", formErrors);

                                Object.values(formErrors).forEach((msg) => {
                                    toast.error(msg);
                                });
                            },
                        },
                    );
                    return;
                }

                setCurrentStep((prev) => Math.min(prev + 1, steps.length));
                return;
            }

            setCurrentStep((prev) => Math.max(prev - 1, 1));
        },
        [currentStep, steps.length, craData, barangay_id],
    );

    const handlePrint = useCallback(() => {
        if (!year) {
            toast.error("Year not set for CRA.");
            return;
        }

        const url = route("cra.pdf", { id: year });
        window.open(url, "_blank");
    }, [year]);
    const formatDateTime = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        if (success) {
            toast.success(success, {
                description: "Your CRA has been successfully submitted!",
                duration: 3000,
                closeButton: true,
            });
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                description: "Operation failed!",
                duration: 3000,
                closeButton: true,
            });
        }
    }, [error]);

    const stepperContextValue = useMemo(
        () => ({
            craData,
            setCraData,
            finalData,
            setFinalData,
            errors,
            setErrors,
            year,
            setYear,
        }),
        [craData, finalData, errors, year],
    );

    return (
        <AdminLayout>
            <Toaster richColors />
            <Head title="CRA" />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />

            <div className="mx-auto mt-6 max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            {/* LEFT */}
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                        Barangay CRA
                                    </span>

                                    {/* ✅ STATUS FROM CONSTANT */}
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                                    Community Risk Assessment{" "}
                                    {year ? `(${year})` : ""}
                                </h1>

                                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                                    Review and update your barangay’s community
                                    risk assessment data including hazards,
                                    resources, and preparedness.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                                    <span>
                                        <span className="font-medium text-slate-600">
                                            Barangay ID:
                                        </span>{" "}
                                        {barangay_id ?? "—"}
                                    </span>

                                    <span>
                                        <span className="font-medium text-slate-600">
                                            Submitted:
                                        </span>{" "}
                                        {formatDateTime(progress?.submitted_at)}
                                    </span>

                                    <span>
                                        <span className="font-medium text-slate-600">
                                            Updated:
                                        </span>{" "}
                                        {formatDateTime(progress?.last_updated)}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT CARD */}
                            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Overall Progress
                                        </p>
                                        <h2 className="mt-1 text-lg font-bold text-slate-800">
                                            CRA Completion
                                        </h2>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${status.bg} ${status.color}`}
                                    >
                                        {percentage}%
                                    </span>
                                </div>

                                {/* ✅ PROGRESS BAR FROM CONSTANT */}
                                <div className="relative h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <div className="mt-3 flex justify-between text-xs text-slate-500">
                                    <span>Status</span>
                                    <span className="font-medium text-slate-700">
                                        {status.short}
                                    </span>
                                </div>

                                <div className="mt-4 text-[11px] text-slate-500">
                                    {status.description}
                                </div>

                                <div className="mt-5">
                                    <button
                                        onClick={handlePrint}
                                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700"

                                        `}
                                    >
                                        Print CRA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-t-xl bg-blue-100 px-2 py-2 shadow-lg sm:px-6 lg:px-8">
                    <Stepper
                        steps={steps}
                        currentStep={currentStep}
                        craData={craData}
                    />
                </div>

                <div className="overflow-hidden rounded-b-xl border border-gray-200 bg-white p-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
                    <div className="my-2 pb-5 pr-5 pl-5 pt-0">
                        <StepperContext.Provider value={stepperContextValue}>
                            {displayStep(currentStep)}
                        </StepperContext.Provider>
                    </div>
                </div>

                <div className="mt-5">
                    <StepperController
                        handleClick={handleClick}
                        currentStep={currentStep}
                        steps={steps}
                        craData={craData}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}

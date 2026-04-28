import { useContext, useEffect, useCallback } from "react";
import { StepperContext } from "@/context/StepperContext";
import toast from "react-hot-toast";
import Accordion from "../Accordion";
import React from "react";
import { toTitleCase } from "@/utils/stringFormat";
import { defaultFacilities, defaultBuildings } from "./defaults";


// ------------------------------------------------------
// Building Table Component
const BuildingTable = React.memo(function BuildingTable({ category, catIdx, defaultCategoryRows, updateRow, removeRow, addRow }) {
    // Determine which types are default to disable editing for them
    const defaultTypesForCategory = defaultCategoryRows.map(row => row.type);

    return (
        <div className="flex flex-col border rounded">
            <h3 className="font-semibold text-md mb-2 p-2">{category.category}</h3>
            <div className="flex-1 overflow-auto">
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 w-[400px]">Type</th>
                            <th className="border px-2 py-1 text-center">Households</th>
                            <th className="px-2 py-1 text-center !border-0 w-[40px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {category.rows.map((row, rowIdx) => {
                            // Check if the current row's type is one of the default types for this category
                            const isDefault = defaultTypesForCategory.includes(row.type);
                            return (
                                <tr key={rowIdx}>
                                    <td className="border px-2 py-1">
                                        {isDefault ? (
                                            // Render as a non-editable span if it's a default type
                                            <span className="block w-full p-1 bg-gray-50 text-gray-700">
                                                {row.type}
                                            </span>
                                        ) : (
                                            // Render as an input field if it's an added row
                                            <input
                                                type="text"
                                                className="w-full border p-1"
                                                value={row.type}
                                                placeholder="Enter type"
                                                onChange={(e) => updateRow(catIdx, rowIdx, "type", toTitleCase(e.target.value))}
                                            />
                                        )}
                                    </td>
                                    <td className="border px-2 py-1 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full border p-1 text-center"
                                            value={row.households ?? ""}
                                            onChange={(e) => updateRow(catIdx, rowIdx, "households", e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-1 text-center !border-0">
                                        {!isDefault && ( // Only show remove button for non-default rows
                                            <button
                                                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                                onClick={() => removeRow(catIdx, rowIdx)}
                                                title="Remove this row"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="p-2 mt-auto">
                <button
                    onClick={() => addRow(catIdx)}
                    className="text-xs px-2 py-1 border border-blue-500 text-blue-600 rounded-md font-medium hover:bg-blue-500 hover:text-white transition-colors duration-200 shadow-sm"
                >
                    + Add new row
                </button>
            </div>
        </div>
    );
});

// ------------------------------------------------------
// Facilities & Services Table Component
const FacilitiesServicesTable = React.memo(function FacilitiesServicesTable({ category, catIdx, defaultCategoryRows, updateRow, removeRow, addRow }) {
    // Determine the reference row for extra fields. Prioritize existing data, then defaults.
    const referenceRow = category.rows?.[0] || defaultCategoryRows?.[0] || {};
    const extraFields = Object.keys(referenceRow).filter(k => k !== "type");
    // Determine which types are default to disable editing for them
    const defaultTypesForCategory = defaultCategoryRows.map(row => row.type);

    const fieldLabels = {
        quantity: "Quantity",
        length: "Length of Road (km)",
        maintained_by: "Who Maintains the Road Network",
    };

    return (
        <div className="flex flex-col border rounded">
            <div className="flex-1 overflow-auto">
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 w-[400px]">{category.category}</th>
                            {extraFields.map(field => (
                                <th key={field} className="border px-2 py-1 text-center">
                                    {fieldLabels[field] || toTitleCase(field.replace(/_/g, " "))}
                                </th>
                            ))}
                            <th className="px-2 py-1 text-center !border-0 w-[40px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {category.rows.map((row, rowIdx) => {
                            // Check if the current row's type is one of the default types for this category
                            const isDefault = defaultTypesForCategory.includes(row.type);
                            return (
                                <tr key={rowIdx}>
                                    <td className="border px-2 py-1">
                                        {isDefault ? (
                                            // Render as a non-editable span if it's a default type
                                            <span className="block w-full p-1 bg-gray-50 text-gray-700">
                                                {row.type}
                                            </span>
                                        ) : (
                                            // Render as an input field if it's an added row
                                            <input
                                                type="text"
                                                className="w-full border p-1"
                                                value={row.type}
                                                placeholder="Enter type"
                                                onChange={(e) => updateRow(catIdx, rowIdx, "type", toTitleCase(e.target.value))}
                                            />
                                        )}
                                    </td>
                                    {extraFields.map(field => (
                                        <td key={field} className="border px-2 py-1 text-center">
                                            <input
                                                type={field === "quantity" || field === "length" ? "number" : "text"}
                                                min={field === "quantity" || field === "length" ? 0 : undefined}
                                                className="w-full border p-1 text-center"
                                                value={row[field] ?? ""}
                                                onChange={(e) => {
                                                    let value = e.target.value;

                                                    // 🔹 Prevent non-numeric input for 'length' or 'quantity'
                                                    if (field === "quantity" || field === "length") {
                                                        // Remove any non-numeric characters (except dot for decimals)
                                                        if (!/^\d*\.?\d*$/.test(value)) {
                                                            return; // ignore invalid characters
                                                        }

                                                        // Ensure it's not below zero
                                                        if (value < 0) value = 0;
                                                    }

                                                    updateRow(catIdx, rowIdx, field, value);
                                                }}
                                            />

                                        </td>
                                    ))}
                                    <td className="px-2 py-1 text-center !border-0">
                                        {!isDefault && ( // Only show remove button for non-default rows
                                            <button
                                                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                                onClick={() => removeRow(catIdx, rowIdx)}
                                                title="Remove this row"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="p-2 mt-auto">
                <button
                    onClick={() => addRow(catIdx)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-500 text-blue-600 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-200 shadow-sm"
                >
                    <span className="text-sm font-bold">+</span> Add new row
                </button>
            </div>
        </div>
    );
});

// ------------------------------------------------------
// Main Component
export default function Buildings() {
    const { craData, setCraData } = useContext(StepperContext);

    useEffect(() => {
        setCraData((prev) => {
            const updated = { ...prev };

            // ✅ FIX: stronger condition
            if (!updated.buildings || updated.buildings.length === 0 || !updated.buildings[0]?.rows) {
                updated.buildings = JSON.parse(JSON.stringify(defaultBuildings));
            }

            if (!updated.facilities || updated.facilities.length === 0 || !updated.facilities[0]?.rows) {
                updated.facilities = JSON.parse(JSON.stringify(defaultFacilities));
            }

            return updated;
        });
    }, [setCraData]);


    // ---------------- Building row helpers ----------------
    const updateBuildingRow = useCallback((catIdx, rowIdx, field, value) => {
        setCraData((prev) => {
            const updatedBuildings = [...prev.buildings]; // Create a new top-level array
            // Safety check for category and row existence
            if (!updatedBuildings[catIdx] || !updatedBuildings[catIdx].rows || !updatedBuildings[catIdx].rows[rowIdx]) {
                console.error("Invalid indices for updateBuildingRow:", catIdx, rowIdx);
                return prev;
            }

            const defaultRowsForCategory = defaultBuildings[catIdx].rows;
            // Check if the current row's type is one of the default types for this category
            const isDefaultType = defaultRowsForCategory.some(defaultRow => defaultRow.type === updatedBuildings[catIdx].rows[rowIdx].type);

            // Prevent editing the 'type' field of default rows
            if (isDefaultType && field === "type") {
                toast.error("Default building types cannot be edited.");
                return prev; // Return previous state if attempting to edit default type
            }

            // Create a new row object to ensure immutability
            const updatedRow = { ...updatedBuildings[catIdx].rows[rowIdx] };
            updatedRow[field] = field === "households" ? (value === "" ? "" : Number(value)) : value;

            // Create a new rows array and update the specific row
            const updatedCategoryRows = [...updatedBuildings[catIdx].rows];
            updatedCategoryRows[rowIdx] = updatedRow;

            // Create a new category object and update its rows
            updatedBuildings[catIdx] = {
                ...updatedBuildings[catIdx],
                rows: updatedCategoryRows
            };

            return { ...prev, buildings: updatedBuildings };
        });
    }, [setCraData]);

    const addBuildingRow = useCallback((catIdx) => {
        setCraData((prev) => {
            const updatedBuildings = [...prev.buildings]; // Create a new array
            const categoryObj = { ...updatedBuildings[catIdx] }; // Create a new category object

            if (!Array.isArray(categoryObj.rows)) {
                categoryObj.rows = [];
            }

            const newRows = [...categoryObj.rows, { type: "", households: "" }]; // Create a new rows array
            categoryObj.rows = newRows;
            updatedBuildings[catIdx] = categoryObj; // Update the category in the new top-level array

            toast.success(`New row added to "${categoryObj.category}"`);
            return { ...prev, buildings: updatedBuildings };
        });
    }, [setCraData]);

    const removeBuildingRow = useCallback((catIdx, rowIdx) => {
        setCraData((prev) => {
            const updatedBuildings = [...prev.buildings]; // Create a new array
            // Safety check
            if (!updatedBuildings[catIdx] || !updatedBuildings[catIdx].rows || !updatedBuildings[catIdx].rows[rowIdx]) {
                console.error("Invalid indices for removeBuildingRow:", catIdx, rowIdx);
                return prev;
            }

            const rowToRemove = updatedBuildings[catIdx].rows[rowIdx];
            const defaultRowsForCategory = defaultBuildings[catIdx].rows;
            // Check if the row to remove is a default row
            const isDefault = defaultRowsForCategory.some(defaultRow => defaultRow.type === rowToRemove.type);

            // Prevent removing default rows
            if (isDefault) {
                toast.error("Default building rows cannot be removed.");
                return prev;
            }

            const removed = rowToRemove.type || "row";

            // Create new rows array by filtering
            const newRows = updatedBuildings[catIdx].rows.filter((_, i) => i !== rowIdx);

            // Create a new category object with the new rows array
            updatedBuildings[catIdx] = {
                ...updatedBuildings[catIdx],
                rows: newRows
            };

            toast.error(`Removed "${removed}" from "${updatedBuildings[catIdx].category}"`);
            return { ...prev, buildings: updatedBuildings };
        });
    }, [setCraData]);

    // ---------------- Facilities row helpers ----------------
    const updateFacilityRow = useCallback((catIdx, rowIdx, field, value) => {
        setCraData((prev) => {
            const updatedFacilities = [...prev.facilities]; // Create a new top-level array
            // Safety check for category and row existence
            if (!updatedFacilities[catIdx] || !updatedFacilities[catIdx].rows || !updatedFacilities[catIdx].rows[rowIdx]) {
                console.error("Invalid indices for updateFacilityRow:", catIdx, rowIdx);
                return prev;
            }

            const defaultRowsForCategory = defaultFacilities[catIdx].rows;
            // Check if the current row's type is one of the default types for this category
            const isDefaultType = defaultRowsForCategory.some(defaultRow => defaultRow.type === updatedFacilities[catIdx].rows[rowIdx].type);

            // Prevent editing the 'type' field of default rows
            if (isDefaultType && field === "type") {
                toast.error("Default facility types cannot be edited.");
                return prev; // Return previous state if attempting to edit default type
            }

            // Create a new row object to ensure immutability
            const updatedRow = { ...updatedFacilities[catIdx].rows[rowIdx] };
            updatedRow[field] = (field === "quantity" || field === "length") ? (value === "" ? "" : Number(value)) : value;

            // Create a new rows array and update the specific row
            const updatedCategoryRows = [...updatedFacilities[catIdx].rows];
            updatedCategoryRows[rowIdx] = updatedRow;

            // Create a new category object and update its rows
            updatedFacilities[catIdx] = {
                ...updatedFacilities[catIdx],
                rows: updatedCategoryRows
            };
            return { ...prev, facilities: updatedFacilities };
        });
    }, [setCraData]);

    const addFacilityRow = useCallback((catIdx) => {
        setCraData((prev) => {
            const updatedFacilities = [...prev.facilities]; // Create a new array
            const categoryObj = { ...updatedFacilities[catIdx] }; // Create a new category object
            const categoryName = categoryObj?.category;

            let rowTemplate = { type: "" }; // Always start with type

            // Determine other fields based on the category
            if (categoryName === "Facilities and Services" || categoryName === "Public Transportation") {
                rowTemplate.quantity = "";
            } else if (categoryName === "Road Types") {
                rowTemplate.length = "";
                rowTemplate.maintained_by = "";
            }

            if (!Array.isArray(categoryObj.rows)) {
                categoryObj.rows = [];
            }

            const newRows = [...categoryObj.rows, rowTemplate]; // Create a new rows array
            categoryObj.rows = newRows;
            updatedFacilities[catIdx] = categoryObj; // Update the category in the new top-level array

            toast.success(`New row added to "${categoryName}"`);
            return { ...prev, facilities: updatedFacilities };
        });
    }, [setCraData]);

    const removeFacilityRow = useCallback((catIdx, rowIdx) => {
        setCraData((prev) => {
            const updatedFacilities = [...prev.facilities]; // Create a new array
            // Safety check
            if (!updatedFacilities[catIdx] || !updatedFacilities[catIdx].rows || !updatedFacilities[catIdx].rows[rowIdx]) {
                console.error("Invalid indices for removeFacilityRow:", catIdx, rowIdx);
                return prev;
            }

            const rowToRemove = updatedFacilities[catIdx].rows[rowIdx];
            const defaultRowsForCategory = defaultFacilities[catIdx].rows;
            // Check if the row to remove is a default row
            const isDefault = defaultRowsForCategory.some(defaultRow => defaultRow.type === rowToRemove.type);

            // Prevent removing default rows
            if (isDefault) {
                toast.error("Default facility rows cannot be removed.");
                return prev;
            }

            const removed = rowToRemove.type || "row";

            // Create new rows array by filtering
            const newRows = updatedFacilities[catIdx].rows.filter((_, i) => i !== rowIdx);

            // Create a new category object with the new rows array
            updatedFacilities[catIdx] = {
                ...updatedFacilities[catIdx],
                rows: newRows
            };

            toast.error(`Removed "${removed}" from "${updatedFacilities[catIdx].category}"`);
            return { ...prev, facilities: updatedFacilities };
        });
    }, [setCraData]);

    const isValidBuildings =
        Array.isArray(craData.buildings) &&
        craData.buildings.length > 0 &&
        craData.buildings.some(cat => Array.isArray(cat.rows) && cat.rows.length > 0);

    const isValidFacilities =
        Array.isArray(craData.facilities) &&
        craData.facilities.length > 0 &&
        craData.facilities.some(cat => Array.isArray(cat.rows) && cat.rows.length > 0);

    const buildingsData = isValidBuildings ? craData.buildings : defaultBuildings;
    const facilitiesData = isValidFacilities ? craData.facilities : defaultFacilities;
    return (
        <div className="space-y-4">
            <Accordion title="D. Buildings and other Facilities in the Barangay">
                <p className="text-sm text-yellow-400 italic mb-2">
                    <strong>Note:</strong> Leave a cell blank if the value is zero. Default building types cannot be removed or edited.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buildingsData.map((cat, idx) => (
                        <BuildingTable
                            key={idx}
                            category={cat}
                            catIdx={idx}
                            defaultCategoryRows={defaultBuildings[idx].rows} // Pass defaults for comparison
                            updateRow={updateBuildingRow}
                            removeRow={removeBuildingRow}
                            addRow={addBuildingRow}
                        />
                    ))}
                </div>
            </Accordion>

            <Accordion title="E. Primary Facilities and Services in the Barangay">
                <p className="text-sm text-yellow-400 italic mb-2">
                    <strong>Note:</strong> Leave a cell blank if the value is zero. Default facility types cannot be removed or edited.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {facilitiesData.slice(0, 2).map((cat, idx) => (
                        <FacilitiesServicesTable
                            key={idx}
                            category={cat}
                            catIdx={idx}
                            defaultCategoryRows={defaultFacilities[idx].rows} // Pass defaults for comparison
                            updateRow={updateFacilityRow}
                            removeRow={removeFacilityRow}
                            addRow={addFacilityRow}
                        />
                    ))}


                    <div className="md:col-span-2">
                        {facilitiesData[2] && ( // Check if the category exists before rendering
                            <FacilitiesServicesTable
                                category={facilitiesData[2]}
                                catIdx={2}
                                defaultCategoryRows={defaultFacilities[2].rows} // Pass defaults for comparison
                                updateRow={updateFacilityRow}
                                removeRow={removeFacilityRow}
                                addRow={addFacilityRow}
                            />
                        )}
                    </div>
                </div>
            </Accordion>
        </div>
    );
}

import {faker} from "@faker-js/faker";
import {Project} from "../Projects/Projects.model.js"
import { Schema } from "../Schemas/schemas.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"

const hash=(str)=> {
    let h = 0;

    for (let i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }

    return h;
}

const sleep = (ms) => {
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    );
};

const searchableValues = (
    obj,
    result = []
) => {

    for (const key in obj) {

        // Ignore noisy fields
        if (
            ["id", "_id", "uuid", "image"]
            .includes(key)
        ) {
            continue;
        }

        const value = obj[key];

        if (
            typeof value === "string" ||
            typeof value === "number"
        ) {
            result.push(
                String(value)
            );
        }

        else if (
            Array.isArray(value)
        ) {
            value.forEach(item =>
                searchableValues(
                    item,
                    result
                )
            );
        }

        else if (
            value &&
            typeof value === "object"
        ) {
            searchableValues(
                value,
                result
            );
        }
    }

    return result;
};

const searchData = (
    data,
    search
) => {

    if (!search) {
        return data;
    }

    return data.filter(item => {

        const text =
            searchableValues(item)
                .join(" ")
                .toLowerCase();

        return text.includes(
            search.toLowerCase()
        );
    });
};

const sortData = (
    data,
    sortField
) => {

    if (!sortField) {
        return data;
    }

    let descending = false;

    if (
        sortField.startsWith("-")
    ) {
        descending = true;

        sortField =
            sortField.slice(1);
    }

    return data.sort(
        (a, b) => {

            const aValue =
                a[sortField];

            const bValue =
                b[sortField];

            if (
                aValue < bValue
            ) {
                return descending
                    ? 1
                    : -1;
            }

            if (
                aValue > bValue
            ) {
                return descending
                    ? -1
                    : 1;
            }

            return 0;
        }
    );
};

const paginateData = ( data,page,limit) => {
    const start =(page - 1) * limit;

    const end =start + limit;

    return {
        data: data.slice(start,end),
        pagination: {
            total: data.length,
            page,
            limit,
            totalPages:Math.ceil(data.length / limit),
        },
    };
};


export {hash,sleep,searchableValues,searchData,sortData,paginateData}
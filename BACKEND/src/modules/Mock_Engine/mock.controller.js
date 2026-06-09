import {faker} from "@faker-js/faker";
import {Project} from "../Projects/Projects.model.js"
import { Schema } from "../Schemas/schemas.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
const generateField = (type) => {
    switch (type) {
        case "string":
            return faker.lorem.word();

        case "number":
            return faker.number.int({
                min: 1,
                max: 1000,
            });

        case "boolean":
            return faker.datatype.boolean();

        case "email":
            return faker.internet.email();

        case "phone":
            return faker.phone.number();

        case "url":
            return faker.internet.url();

        case "image":
            return faker.image.url();

        case "uuid":
            return faker.string.uuid();

        case "name":
            return faker.person.fullName();

        case "date":
            return faker.date.recent();

        default:
            return null;
    }
};

const generateRecord = (fields) => {
    const record = {};

    for (const field of fields) {

        if (field.type === "object") {
            record[field.fieldName] =
                generateRecord(
                    field.children || []
                );
        }

        else {
            record[field.fieldName] =
                generateField(field.type);
        }
    }

    return record;
};

const getMockData = asyncHandler(async (req, res) => {

        const {projectSlug, endpointName} = req.params;

        const project =await Project.findOne({projectSlug,});

        if (!project) {
            throw new ApiError(
                404,
                "Project not found"
            );
        }

        const schema =await Schema.findOne({projectId: project._id,endpointName });

        if (!schema) {
            throw new ApiError(
                404,
                "Endpoint not found"
            );
        }

        const data =generateRecord(schema.fields);

        return res.status(200).json(
            new ApiResponse(
                200,
                data,
                "Mock data generated successfully"
            )
        );
    }
);

export{getMockData}
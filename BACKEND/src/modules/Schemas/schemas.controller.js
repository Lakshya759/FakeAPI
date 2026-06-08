import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Schema } from "./schemas.model.js";
import { Project } from "../Projects/Projects.model.js";

const createSchema = asyncHandler(async (req, res) => {
    const {
        projectId,
        schemaName,
        endpointName,
        fields = []
    } = req.body || {};

    if (!projectId) {
        throw new ApiError(
            400,
            "Project ID is required"
        );
    }

    if (!schemaName?.trim()) {
        throw new ApiError(
            400,
            "Schema name is required"
        );
    }

    if (!endpointName?.trim()) {
        throw new ApiError(
            400,
            "Endpoint name is required"
        );
    }

    const project = await Project.findOne({
        _id: projectId,
        userId: req.user._id,
    });

    if (!project) {
        throw new ApiError(
            404,
            "Project not found or unauthorized"
        );
    }

    const existingEndpoint = await Schema.findOne({
        projectId,
        endpointName: endpointName
            .trim()
            .toLowerCase(),
    });

    if (existingEndpoint) {
        throw new ApiError(
            409,
            "Endpoint name already exists in this project"
        );
    }

    const schema = await Schema.create({
        projectId,

        schemaName: schemaName.trim(),

        endpointName: endpointName
            .trim()
            .toLowerCase(),

        fields,

        settings: {
            defaultCount: 10,
            delay: 0,
            errorRate: 0,
            errorCode: 500,
            crud: false,
        },
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            schema,
            "Schema created successfully"
        )
    );
});

const getSchemaById = asyncHandler(async (req, res) => {
    const schema = await Schema.findById(req.params.id);

    if (!schema) {
        throw new ApiError(404, "Schema not found");
    }

    const project = await Project.findOne({
        _id: schema.projectId,
        userId: req.user._id,
    });

    if (!project) {
        throw new ApiError(403, "Access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, schema)
    );
});

const updateSchema = asyncHandler(async (req, res) => {
    const {
        schemaName,
        endpointName,
        fields,
        settings,
    } = req.body;

    const schema = await Schema.findById(
        req.params.id
    );

    if (!schema) {
        throw new ApiError(
            404,
            "Schema not found"
        );
    }

    const project = await Project.findOne({
        _id: schema.projectId,
        userId: req.user._id,
    });

    if (!project) {
        throw new ApiError(
            403,
            "Access denied"
        );
    }

    if (!schemaName?.trim()) {
        throw new ApiError(
            400,
            "Schema name is required"
        );
    }

    if (!endpointName?.trim()) {
        throw new ApiError(
            400,
            "Endpoint name is required"
        );
    }

    const duplicateEndpoint =
        await Schema.findOne({
            projectId: schema.projectId,

            endpointName: endpointName
                .trim()
                .toLowerCase(),

            _id: {
                $ne: schema._id,
            },
        });

    if (duplicateEndpoint) {
        throw new ApiError(
            409,
            "Endpoint name already exists in this project"
        );
    }

    schema.schemaName =
        schemaName.trim();

    schema.endpointName =
        endpointName
            .trim()
            .toLowerCase();

    if (fields) {
        schema.fields = fields;
    }

    if (settings) {
        schema.settings = {
            ...schema.settings,
            ...settings,
        };
    }

    await schema.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            schema,
            "Schema updated successfully"
        )
    );
});

const deleteSchema = asyncHandler(async (req, res) => {
    const schema = await Schema.findById(req.params.id);

    if (!schema) {
        throw new ApiError(404, "Schema not found");
    }

    const project = await Project.findOne({
        _id: schema.projectId,
        userId: req.user._id,
    });

    if (!project) {
        throw new ApiError(403, "Access denied");
    }

    // Delete endpoint associated with this schema

    // await Endpoint.deleteMany({
    //     schemaId: schema._id,
    // });

    // Delete schema
    await Schema.findByIdAndDelete(schema._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Schema deleted successfully"
        )
    );
});

export {createSchema,getSchemaById,updateSchema,deleteSchema}
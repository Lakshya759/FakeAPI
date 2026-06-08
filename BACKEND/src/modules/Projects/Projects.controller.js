import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import {Project} from "./Projects.model.js"
import {Schema} from "../Schemas/schemas.model.js"
import {nanoid} from "nanoid"



const createProject = asyncHandler(async (req, res) => {
    const { projectName, description } = req.body;

    if (!projectName?.trim()) {
        throw new ApiError(400, "Project name is required");
    }

    const existingProject = await Project.findOne({
        userId: req.user._id,
        projectName: projectName.trim(),
    });

    if (existingProject) {
        throw new ApiError(
            409,
            "A project with this name already exists"
        );
    }

    const project = await Project.create({
        userId: req.user._id,
        projectName: projectName.trim(),
        description: description?.trim() || "",
        projectSlug: nanoid(8),
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            project,
            "Project created successfully"
        )
    );
});

const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const project = await Project.findOne({
        _id: id,
        userId: req.user._id,
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const schemas = await Schema.find({
        projectId: project._id,
    });

    const schemaIds = schemas.map((schema) => schema._id);

    // await Endpoint.deleteMany({
    //     schemaId: { $in: schemaIds },
    // });

    await Schema.deleteMany({
        projectId: project._id,
    });

    await Project.findByIdAndDelete(project._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Project and all associated schemas/endpoints deleted successfully"
        )
    );
});

export{createProject,deleteProject}


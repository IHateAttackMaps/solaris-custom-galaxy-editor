import type { CarrierWaypointActionType } from "./CarrierWaypoint"

export interface Settings {
    version: number,
    visual: {
        resources: 'numbers' | 'planets' | 'single-ring',
        objectScaling: 'default' | 'clamped',
        objectMinimumScale: number,
        objectMaximumScale: number,
        redCapitals: 'enabled' | 'disabled',
        zoomLevels: {
            star: {
                shipCount: number,
                id: number,
                resources: number,
                infrastructure: number
            },
            carrier: {
                carrierShips: number
            }
        },
        resourcesRingOpacity: number,
        displayGalaxyCenter: 'disabled' | 'midpoint' | 'centroid',
        displayScaleBar: 'enabled' | 'disabled',
        displayCursorCoordinates: 'enabled' | 'disabled',
        colourCustomNames: 'enabled' | 'disabled',
        carrierPathWidth: number,
        carrierLoopStyle: 'solid' | 'dashed',
        carrierPathDashLength: number,
        brushGraphicsOpacity: number,
        brushGraphicsWidth: number,
        brushPointOpacity: number,
        displaySelectionBounds: 'enabled' | 'disabled',
        selectionBoundWidth: number,
        selectionBoundOpacity: number,
        selectionMarkerBoundWidth: number,
        selectionMarkerBoundOpacity: number,
        selectionMoveBoundWidth: number,
        selectionMoveBoundOpacity: number,
        selectionMoveFillOpacity: number,
        selectionMovePointOpacity: number
    },
    players: {
        newCredits: number,
        newCreditsSpecialists: number,
        newTechnology: {
            scanning: number,
            hyperspace: number,
            terraforming: number,
            experimentation: number,
            weapons: number,
            banking: number,
            manufacturing: number,
            specialists: number
        }
    },
    brush: {
        defaultBrushShape: 'circle' | 'square',
        defaultBrushRadius: number,
        defaultStarAmount: number,
        defaultSnapTargetMode: 'auto' | 'manual' | 'none',
        defaultSnapRadius: number,
        defaultSnapSteps: number,
        defaultStepOffset: number,
        newEconomyResources: number,
        newIndustryResources: number,
        newScienceResources: number,
        newEconomyInfrastructure: number,
        newIndustryInfrastructure: number,
        newScienceInfrastructure: number,
        newSpecialist: number | null,
        newIsNebula: boolean,
        newIsAsteroidField: boolean,
        newIsBinary: boolean,
        newIsBlackHole: boolean,
        newIsPulsar: boolean,
        newHasWarpGate: boolean,
    },
    transform: {
        copyCarriers: boolean
    },
    random: {
        minEconomyResources: number,
        maxEconomyResources: number,
        minIndustryResources: number,
        maxIndustryResources: number,
        minScienceResources: number,
        maxScienceResources: number,
        minEconomyInfrastructure: number,
        maxEconomyInfrastructure: number,
        minIndustryInfrastructure: number,
        maxIndustryInfrastructure: number,
        minScienceInfrastructure: number,
        maxScienceInfrastructure: number,
        nebulaPercentage: number,
        asteroidFieldPercentage: number,
        binaryPercentage: number,
        blackHolePercentage: number,
        pulsarPercentage: number,
        warpGatePercentage: number,
        wormHolePercentage: number,
        lowValueBiasNR: number,
        lowValueBiasInfra: number,
        radiusWeightNR: number,
        radiusWeightInfra: number
    },
    carriers: {
        baseCarrierSpeed: number,
        defaultAction: CarrierWaypointActionType,
        defaultActionShips: number,
        defaultCarrierShips: number,
        defaultCarrierSpecialist: string | null
    },
    json: {
        simplifyIds: 'enabled' | 'disabled',
        ignoreCustomNames: 'always' | 'when-importing' | 'disabled',
        formatOutput: 'spaces' | 'tabs' | 'disabled',
        formatOutputSpaces: number
    },
    ruler: {
        separateBaseCarrierSpeed: 'enabled' | 'disabled'
        rulerBaseCarrierSpeed: number
    },
    confirmations: {
        confirmDeleteSelection: 'always' | 'when-deleting-carriers' | 'disabled',
        confirmDeleteStar: 'always' | 'when-deleting-carriers' | 'disabled',
        confirmDeleteCarrier: 'enabled' | 'disabled',
        confirmDeletePlayer: 'always' | 'when-deleting-carriers' | 'disabled',
        confirmDeleteTeam: 'enabled' | 'disabled',
        confirmTransferPlayers: 'enabled' | 'disabled'
    },
    technical: {
        performanceMonitor: 'enabled' | 'disabled',
        chunkVisualizer: 'enabled' | 'disabled',
        allowChangeId: 'enabled' | 'disabled'
    }
}
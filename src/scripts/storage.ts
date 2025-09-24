import type { Settings } from "./types/Settings";

class StorageService {
    static currentVersion = 2; // Increment when adding new settings

    settings = {} as Settings;

    saveSettings(settings: Settings) {
        try {
            localStorage.setItem('settings', JSON.stringify(settings));
        } catch (e) {
            throw new Error("Could not save settings!");
        }
    }

    loadSettings() {
        const json = localStorage.getItem('settings');
        if (!json) {
            this.settings = this.loadDefaultSettings();
            return;
        }
        try {
            this.settings = JSON.parse(json) as Settings;

            if (!this.settings.version || this.settings.version < StorageService.currentVersion) {
                // Reset stored data when new settings have been added to avoid errors
                this.settings = this.loadDefaultSettings();
            }
        } catch (e) {
            throw new Error("Could not parse settings!");
        }
    }

    loadDefaultSettings() {
        return {
            version: StorageService.currentVersion,
            visual: {
                resources: 'numbers',
                objectScaling: 'default',
                objectMinimumScale: 8,
                objectMaximumScale: 16,
                redCapitals: 'disabled',
                zoomLevels: {
                    star: {
                        shipCount: 120,
                        id: 240,
                        resources: 160,
                        infrastructure: 160,
                    },
                    carrier: {
                        carrierShips: 140
                    }
                },
                resourcesRingOpacity: 0.1,
                displayGalaxyCenter: 'midpoint',
                displayScaleBar: 'enabled',
                colourCustomNames: 'enabled',
                displayCursorCoordinates: 'enabled',
                carrierPathWidth: 1,
                carrierLoopStyle: 'dashed',
                carrierPathDashLength: 6,
                brushGraphicsOpacity: 1,
                brushGraphicsWidth: 6,
                brushPointOpacity: 0.5,
                displaySelectionBounds: 'enabled',
                selectionBoundWidth: 1,
                selectionBoundOpacity: 0.8,
                selectionMarkerBoundWidth: 1,
                selectionMarkerBoundOpacity: 1,
                selectionMoveBoundWidth: 1,
                selectionMoveBoundOpacity: 0.8,
                selectionMoveFillOpacity: 0.1,
                selectionMovePointOpacity: 1
            },
            players: {
                newCredits: 500,
                newCreditsSpecialists: 5,
                newTechnology: {
                    scanning: 1,
                    hyperspace: 1,
                    terraforming: 1,
                    experimentation: 1,
                    weapons: 1,
                    banking: 1,
                    manufacturing: 1,
                    specialists: 1
                }
            },
            brush: {
                defaultBrushShape: 'circle',
                defaultBrushRadius: 0,
                defaultStarAmount: 1,
                defaultSnapTargetMode: 'auto',
                defaultSnapRadius: 1,
                defaultSnapSteps: 6,
                defaultStepOffset: 0,
                newEconomyResources: 25,
                newIndustryResources: 25,
                newScienceResources: 25,
                newEconomyInfrastructure: 0,
                newIndustryInfrastructure: 0,
                newScienceInfrastructure: 0,
                newSpecialist: null,
                newIsNebula: false,
                newIsAsteroidField: false,
                newIsBinary: false,
                newIsBlackHole: false,
                newIsPulsar: false,
                newHasWarpGate: false
            },
            transform: {
                copyCarriers: true
            },
            random: {
                minEconomyResources: 10,
                maxEconomyResources: 50,
                minIndustryResources: 10,
                maxIndustryResources: 50,
                minScienceResources: 10,
                maxScienceResources: 50,
                minEconomyInfrastructure: 0,
                maxEconomyInfrastructure: 0,
                minIndustryInfrastructure: 0,
                maxIndustryInfrastructure: 0,
                minScienceInfrastructure: 0,
                maxScienceInfrastructure: 0,
                nebulaPercentage: 0,
                asteroidFieldPercentage: 0,
                binaryPercentage: 0,
                blackHolePercentage: 0,
                pulsarPercentage: 0,
                warpGatePercentage: 0,
                wormHolePercentage: 0,
                lowValueBiasNR: 0.5,
                lowValueBiasInfra: 0.5,
                radiusWeightNR: 0,
                radiusWeightInfra: 0
            },
            carriers: {
                baseCarrierSpeed: 10,
                defaultAction: 'collectAll',
                defaultActionShips: 0,
                defaultCarrierShips: 1,
                defaultCarrierSpecialist: null
            },
            json: {
                ignoreCustomNames: 'disabled',
                simplifyIds: 'disabled'
            },
            ruler: {
                separateBaseCarrierSpeed: 'disabled',
                rulerBaseCarrierSpeed: 10
            },
            confirmations: {
                confirmDeleteSelection: 'always',
                confirmDeleteStar: 'always',
                confirmDeleteCarrier: 'enabled',
                confirmDeletePlayer: 'always',
                confirmDeleteTeam: 'enabled',
                confirmTransferPlayers: 'enabled'
            },
            technical: {
                performanceMonitor: 'disabled',
                chunkVisualizer: 'disabled',
                allowChangeId: 'disabled'
            }
        } as Settings
    }

    getSettings() {
        return this.settings;
    }
}

export default new StorageService();
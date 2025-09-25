<template>
    <div class="menu-page">
        <menu-title :title="'Settings'" />
        <form @submit.prevent="submit">

            <collapse-panel title="Visual" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="naturalResources" class="col-12 col-sm-6 col-form-label">Resource Display Type</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="naturalResources" v-model="settings.visual.resources">
                            <option value="numbers">Numbers</option>
                            <option value="single-ring">Single Ring</option>
                            <option value="planets">Planets</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.visual.resources !== 'numbers'">
                    <label for="resourcesRingOpacity" class="col-12 col-sm-6 col-form-label sub-option-label">Resource
                        Ring Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control" id="resourcesRingOpacity"
                            v-model="settings.visual.resourcesRingOpacity" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="objectScaling" class="col-12 col-sm-6 col-form-label">Object Scaling</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="objectScaling" v-model="settings.visual.objectScaling">
                            <option value="default">Default</option>
                            <option value="clamped">Clamped</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.visual.objectScaling === 'clamped'">
                    <label for="minimumScale" class="col-12 col-sm-6 col-form-label sub-option-label">Minimum
                        Scale</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="minimumScale"
                            v-model="settings.visual.objectMinimumScale" />
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.visual.objectScaling === 'clamped'">
                    <label for="maximumScale" min="0" class="col-12 col-sm-6 col-form-label sub-option-label">Maximum
                        Scale</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" class="form-control" id="maximumScale"
                            v-model="settings.visual.objectMaximumScale" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="redCapitals" class="col-12 col-sm-6 col-form-label">Red Capitals</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="redCapitals" v-model="settings.visual.redCapitals">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>

                <div class="row pt-1 pb-1">
                    <label for="" class="col col-form-label">Zoom Levels (%)</label>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="starShipCountZoom" class="col-12 col-sm-6 col-form-label sub-option-label">Star
                        Ships</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="starShipCountZoom"
                            v-model="settings.visual.zoomLevels.star.shipCount" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="starIdZoom" class="col-12 col-sm-6 col-form-label sub-option-label">Star ID</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="starIdZoom"
                            v-model="settings.visual.zoomLevels.star.id" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="starResourcesZoom"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="starResourcesZoom"
                            v-model="settings.visual.zoomLevels.star.resources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="starInfrastructureZoom"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="starInfrastructureZoom"
                            v-model="settings.visual.zoomLevels.star.infrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="carrierShipCountZoom" class="col-12 col-sm-6 col-form-label sub-option-label">Carrier
                        Ships</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="carrierShipCountZoom"
                            v-model="settings.visual.zoomLevels.carrier.carrierShips" />
                    </div>
                </div>

                <div class="row pt-1 pb-1">
                    <label for="displayGalaxyCenter" class="col-12 col-sm-6 col-form-label">Display Galaxy
                        Center</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="displayGalaxyCenter"
                            v-model="settings.visual.displayGalaxyCenter">
                            <option value="disabled">Disabled</option>
                            <option value="midpoint">Midpoint</option>
                            <option value="centroid">Centroid</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="displayScaleBar" class="col-12 col-sm-6 col-form-label">Display Scale Bar</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="displayScaleBar" v-model="settings.visual.displayScaleBar">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="displayCursorCoordinates" class="col-12 col-sm-6 col-form-label">Display Cursor
                        Coordinates</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="displayCursorCoordinates"
                            v-model="settings.visual.displayCursorCoordinates">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="colourCustomNames" class="col-12 col-sm-6 col-form-label">Highlight Custom
                        Names</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="colourCustomNames" v-model="settings.visual.colourCustomNames">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="carrierPathWidth" class="col-12 col-sm-6 col-form-label">Carrier Path Width</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="carrierPathWidth"
                            v-model="settings.visual.carrierPathWidth" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="carrierLoopStyle" class="col-12 col-sm-6 col-form-label">Carrier Loop Style</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="carrierLoopStyle" v-model="settings.visual.carrierLoopStyle">
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.visual.carrierLoopStyle === 'dashed'">
                    <label for="carrierPathDashLength" class="col-12 col-sm-6 col-form-label sub-option-label">Carrier
                        Path
                        Dash Length</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="1" max="16" class="form-control" id="carrierPathDashLength"
                            v-model="settings.visual.carrierPathDashLength" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="brushGraphicsWidth" class="col-12 col-sm-6 col-form-label">Brush Bounds
                        Width</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="brushGraphicsWidth"
                            v-model="settings.visual.brushGraphicsWidth" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="brushGraphicsOpacity" class="col-12 col-sm-6 col-form-label">Brush Bounds
                        Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control" id="brushGraphicsOpacity"
                            v-model="settings.visual.brushGraphicsOpacity" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="brushGraphicsOpacity" class="col-12 col-sm-6 col-form-label">Brush Point
                        Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control" id="brushGraphicsOpacity"
                            v-model="settings.visual.brushPointOpacity" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="displaySelectionBounds" class="col-12 col-sm-6 col-form-label">Display Selection
                        Bounds</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="displaySelectionBounds"
                            v-model="settings.visual.displaySelectionBounds">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.visual.displaySelectionBounds === 'enabled'">
                    <label for="selectionBoundWidth" class="col-12 col-sm-6 col-form-label sub-option-label">Selection
                        Bounds Width</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="selectionBoundWidth"
                            v-model="settings.visual.selectionBoundWidth" />
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.visual.displaySelectionBounds === 'enabled'">
                    <label for="selectionBoundOpacity" class="col-12 col-sm-6 col-form-label sub-option-label">Selection
                        Bounds Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control" id="selectionBoundOpacity"
                            v-model="settings.visual.selectionBoundOpacity" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="selectionMarkerBoundWidth" class="col-12 col-sm-6 col-form-label">Selection Marker
                        Bounds Width</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="selectionMarkerBoundWidth"
                            v-model="settings.visual.selectionMarkerBoundWidth" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="selectionMarkerBoundOpacity" class="col-12 col-sm-6 col-form-label">Selection Marker
                        Bounds Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control"
                            id="selectionMarkerBoundOpacity" v-model="settings.visual.selectionMarkerBoundOpacity" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="selectionMoveBoundWidth" class="col-12 col-sm-6 col-form-label">Selection Move
                        Bounds Width</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" class="form-control" id="selectionMoveBoundWidth"
                            v-model="settings.visual.selectionMoveBoundWidth" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="selectionMoveBoundOpacity" class="col-12 col-sm-6 col-form-label">Selection Move
                        Bounds Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control"
                            id="selectionMoveBoundOpacity" v-model="settings.visual.selectionMoveBoundOpacity" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="selectionMovePointOpacity" class="col-12 col-sm-6 col-form-label">Selection Move
                        Point Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control"
                            id="selectionMovePointOpacity" v-model="settings.visual.selectionMovePointOpacity" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="selectionMoveFillOpacity" class="col-12 col-sm-6 col-form-label">Selection Move
                        Fill Opacity</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="0.05" class="form-control"
                            id="selectionMoveFillOpacity" v-model="settings.visual.selectionMoveFillOpacity" />
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Players" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="" class="col col-form-label">New Player Values</label>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newScanning" class="col-12 col-sm-6 col-form-label sub-option-label">Scanning Technology
                        Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="1" step="1" class="form-control" id="newScanning"
                            v-model="settings.players.newTechnology.scanning" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newHyperspace" class="col-12 col-sm-6 col-form-label sub-option-label">Hyperspace
                        Technology Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="1" step="1" class="form-control" id="newHyperspace"
                            v-model="settings.players.newTechnology.hyperspace" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newTerraforming" class="col-12 col-sm-6 col-form-label sub-option-label">Terraforming
                        Technology Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="1" step="1" class="form-control" id="newTerraforming"
                            v-model="settings.players.newTechnology.terraforming" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newExperimentation"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Experimentation Technology Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newExperimentation"
                            v-model="settings.players.newTechnology.experimentation" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newWeapons" class="col-12 col-sm-6 col-form-label sub-option-label">Weapons Technology
                        Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="1" step="1" class="form-control" id="newWeapons"
                            v-model="settings.players.newTechnology.weapons" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newBanking" class="col-12 col-sm-6 col-form-label sub-option-label">Banking Technology
                        Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newBanking"
                            v-model="settings.players.newTechnology.banking" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newManufacturing" class="col-12 col-sm-6 col-form-label sub-option-label">Manufacturing
                        Technology Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="1" step="1" class="form-control" id="newManufacturing"
                            v-model="settings.players.newTechnology.manufacturing" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newSpecialists" class="col-12 col-sm-6 col-form-label sub-option-label">Specialists
                        Technology Level</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newSpecialists"
                            v-model="settings.players.newTechnology.specialists" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newCredits" class="col-12 col-sm-6 col-form-label sub-option-label">Credits</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newCredits"
                            v-model="settings.players.newCredits" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newCreditsSpecialists"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Specialist Tokens</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="1" step="1" class="form-control" id="newCreditsSpecialists"
                            v-model="settings.players.newCreditsSpecialists" />
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Brush" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="defaultBrushShape" class="col-12 col-sm-6 col-form-label">Default Brush
                        Shape</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="defaultBrushShape" v-model="settings.brush.defaultBrushShape">
                            <option value="circle">Circle</option>
                            <option value="square">Square</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultBrushRadius" class="col-12 col-sm-6 col-form-label">Default Brush Radius</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" class="form-control" id="defaultBrushRadius"
                            v-model="settings.brush.defaultBrushRadius" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultStarAmount" class="col-12 col-sm-6 col-form-label">Default Star Amount</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" class="form-control" id="defaultStarAmount"
                            v-model="settings.brush.defaultStarAmount" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultSnapMode" class="col-12 col-sm-6 col-form-label">Default Snap Target Mode</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="defaultSnapMode"
                            v-model="settings.brush.defaultSnapTargetMode">
                            <option value="none">None</option>
                            <option value="auto">Auto</option>
                            <option value="manual">Manual</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultSnapRadius" class="col-12 col-sm-6 col-form-label">Default Snap Radius</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" class="form-control" id="defaultSnapRadius"
                            v-model="settings.brush.defaultSnapRadius" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultSnapSteps" class="col-12 col-sm-6 col-form-label">Default Snap Steps</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" class="form-control" id="defaultSnapSteps"
                            v-model="settings.brush.defaultSnapSteps" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultStepOffset" class="col-12 col-sm-6 col-form-label">Default Step Offset</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" class="form-control" id="defaultStepOffset"
                            v-model="settings.brush.defaultStepOffset" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="" class="col col-form-label">New Star Values</label>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newEconomyResources" class="col-12 col-sm-6 col-form-label sub-option-label">Natural
                        Economic Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newEconomyResources"
                            v-model="settings.brush.newEconomyResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newIndustryResources" class="col-12 col-sm-6 col-form-label sub-option-label">Natural
                        Industrial Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newIndustryResources"
                            v-model="settings.brush.newIndustryResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newScienceResources" class="col-12 col-sm-6 col-form-label sub-option-label">Natural
                        Scientific Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newScienceResources"
                            v-model="settings.brush.newScienceResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newEconomyInfrastructure" class="col-12 col-sm-6 col-form-label sub-option-label">
                        Economic Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newEconomyInfrastructure"
                            v-model="settings.brush.newEconomyInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newIndustryInfrastructure" class="col-12 col-sm-6 col-form-label sub-option-label">
                        Industrial Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newIndustryInfrastructure"
                            v-model="settings.brush.newIndustryInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newScienceInfrastructure" class="col-12 col-sm-6 col-form-label sub-option-label">
                        Scientific Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="newScienceInfrastructure"
                            v-model="settings.brush.newScienceInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newSpecialist"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Specialist</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="newSpecialist" v-model="settings.brush.newSpecialist">
                            <option v-for="specialist in starSelectionSpecialists" :value="specialist.id">
                                {{ specialist.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newIsNebula" class="col-12 col-sm-6 col-form-label sub-option-label">Is Nebula</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="newIsNebula" v-model="settings.brush.newIsNebula">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newIsAsteroidField" class="col-12 col-sm-6 col-form-label sub-option-label">Is Asteroid
                        Field</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="newIsAsteroidField"
                            v-model="settings.brush.newIsAsteroidField">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newIsBinary" class="col-12 col-sm-6 col-form-label sub-option-label">Is Binary</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="newIsBinary" v-model="settings.brush.newIsBinary">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newIsBlackHole" class="col-12 col-sm-6 col-form-label sub-option-label">Is Black
                        Hole</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="newIsBlackHole" v-model="settings.brush.newIsBlackHole">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newIsPulsar" class="col-12 col-sm-6 col-form-label sub-option-label">Is Pulsar</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="newIsPulsar" v-model="settings.brush.newIsPulsar">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="newHasWarpGate" class="col-12 col-sm-6 col-form-label sub-option-label">Has Warp
                        Gate</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="newHasWarpGate" v-model="settings.brush.newHasWarpGate">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Transform" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="copyCarriers" class="col-12 col-sm-6 col-form-label">Copy Carriers By Default</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="copyCarriers" v-model="settings.transform.copyCarriers">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Randomisation" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="minEconomyResources" class="col-12 col-sm-6 col-form-label">Default Minimum Natural
                        Economic Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="minEconomyResources"
                            v-model="settings.random.minEconomyResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="maxEconomyResources" class="col-12 col-sm-6 col-form-label">Default Maximum Natural
                        Economic Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="maxEconomyResources"
                            v-model="settings.random.maxEconomyResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="minIndustryResources" class="col-12 col-sm-6 col-form-label">Default Minimum Natural
                        Industrial Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="minIndustryResources"
                            v-model="settings.random.minIndustryResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="maxIndustryResources" class="col-12 col-sm-6 col-form-label">Default Maximum Natural
                        Industrial Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="maxIndustryResources"
                            v-model="settings.random.maxIndustryResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="minScienceResources" class="col-12 col-sm-6 col-form-label">Default Minimum Natural
                        Scientific Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="minScienceResources"
                            v-model="settings.random.minScienceResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="maxScienceResources" class="col-12 col-sm-6 col-form-label">Default Maximum Natural
                        Scientific Resources</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="maxScienceResources"
                            v-model="settings.random.maxScienceResources" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="minEconomyInfrastructure" class="col-12 col-sm-6 col-form-label">Default Minimum
                        Economic Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="minEconomyInfrastructure"
                            v-model="settings.random.minEconomyInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="maxEconomyInfrastructure" class="col-12 col-sm-6 col-form-label">Default Maximum
                        Economic Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="maxEconomyInfrastructure"
                            v-model="settings.random.maxEconomyInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="minIndustryInfrastructure" class="col-12 col-sm-6 col-form-label">Default Minimum
                        Industrial Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="minIndustryInfrastructure"
                            v-model="settings.random.minIndustryInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="maxIndustryInfrastructure" class="col-12 col-sm-6 col-form-label">Default Maximum
                        Industrial Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="maxIndustryInfrastructure"
                            v-model="settings.random.maxIndustryInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="minScienceInfrastructure" class="col-12 col-sm-6 col-form-label">Default Minimum
                        Scientific Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="minScienceInfrastructure"
                            v-model="settings.random.minScienceInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="maxScienceInfrastructure" class="col-12 col-sm-6 col-form-label">Default Maximum
                        Scientific Infrastructure</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="maxScienceInfrastructure"
                            v-model="settings.random.maxScienceInfrastructure" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="" class="col col-form-label">Default Distribution Bias</label>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="lowValueBiasNR" class="col-12 col-sm-6 col-form-label sub-option-label">Natural Resource
                        Low Value Bias</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="any" class="form-control" id="lowValueBiasNR"
                            v-model="settings.random.lowValueBiasNR" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="radiusWeightNR" class="col-12 col-sm-6 col-form-label sub-option-label">Natural Resource
                        Radius Weight</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="any" class="form-control" id="radiusWeightNR"
                            v-model="settings.random.radiusWeightNR" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="lowValueBiasInfra"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Infrastructure
                        Low Value Bias</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="any" class="form-control" id="lowValueBiasInfra"
                            v-model="settings.random.lowValueBiasInfra" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="radiusWeightInfra"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Infrastructure
                        Radius Weight</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="1" step="any" class="form-control" id="radiusWeightInfra"
                            v-model="settings.random.radiusWeightInfra" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="asteroidFieldPercentage" class="col-12 col-sm-6 col-form-label">Default Asteroid Field
                        Percentage</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="100" step="any" class="form-control"
                            id="asteroidFieldPercentage" v-model="settings.random.asteroidFieldPercentage" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="binaryPercentage" class="col-12 col-sm-6 col-form-label">Default Binary Star
                        Percentage</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="100" step="any" class="form-control" id="binaryPercentage"
                            v-model="settings.random.binaryPercentage" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="blackHolePercentage" class="col-12 col-sm-6 col-form-label">Default Black Hole
                        Percentage</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="100" step="any" class="form-control" id="blackHolePercentage"
                            v-model="settings.random.blackHolePercentage" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="nebulaPercentage" class="col-12 col-sm-6 col-form-label">Default Nebula
                        Percentage</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="100" step="any" class="form-control" id="nebulaPercentage"
                            v-model="settings.random.nebulaPercentage" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="pulsarPercentage" class="col-12 col-sm-6 col-form-label">Default Pulsar
                        Percentage</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="100" step="any" class="form-control" id="pulsarPercentage"
                            v-model="settings.random.pulsarPercentage" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="warpGatePercentage" class="col-12 col-sm-6 col-form-label">Default Warp Gate
                        Percentage</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="100" step="any" class="form-control" id="warpGatePercentage"
                            v-model="settings.random.warpGatePercentage" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="wormHolePercentage" class="col-12 col-sm-6 col-form-label">Default Wormhole
                        Percentage</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" max="100" step="any" class="form-control" id="wormHolePercentage"
                            v-model="settings.random.wormHolePercentage" />
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Carriers" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="defaultBaseCarrierSpeed" class="col-12 col-sm-6 col-form-label">Base Carrier
                        Speed</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="defaultBaseCarrierSpeed"
                            v-model="settings.carriers.baseCarrierSpeed">
                            <option value="1">Crazy Slow (0.02 ly/tick)</option>
                            <option value="2.5">Very Slow (0.05 ly/tick)</option>
                            <option value="5">Slow (0.1 ly/tick)</option>
                            <option value="10">Standard (0.2 ly/tick)</option>
                            <option value="15">Fast (0.3 ly/tick)</option>
                            <option value="20">Very Fast (0.4 ly/tick)</option>
                            <option value="25">Crazy Fast (0.5 ly/tick)</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="" class="col col-form-label">Default Carrier Values</label>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultCarrierShips"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Ships</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="defaultCarrierShips"
                            v-model="settings.carriers.defaultCarrierShips" />
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultCarrierSpecialist"
                        class="col-12 col-sm-6 col-form-label sub-option-label">Specialist</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="defaultCarrierSpecialist"
                            v-model="settings.carriers.defaultCarrierSpecialist">
                            <option v-for="specialist in carrierSelectionSpecialists" :value="specialist.id">
                                {{ specialist.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="" class="col col-form-label">Default Waypoint Values</label>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultAction" class="col-12 col-sm-6 col-form-label sub-option-label">Action</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="defaultAction" v-model="settings.carriers.defaultAction">
                            <option value="nothing">Do Nothing</option>
                            <option value="collectAll">Collect All</option>
                            <option value="dropAll">Drop All</option>
                            <option value="collect">Collect N</option>
                            <option value="drop">Drop N</option>
                            <option value="collectAllBut">Collect All But N</option>
                            <option value="dropAllBut">Drop All But N</option>
                            <option value="garrison">Garrison N</option>
                            <option value="collectPercentage">Collect %</option>
                            <option value="dropPercentage">Drop %</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="defaultActionShips" class="col-12 col-sm-6 col-form-label sub-option-label">Action
                        Value</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="defaultActionShips"
                            v-model="settings.carriers.defaultActionShips" />
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="JSON" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="ignoreCustomNames" class="col-12 col-sm-6 col-form-label">Ignore Custom Names</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="ignoreCustomNames" v-model="settings.json.ignoreCustomNames">
                            <option value="disabled">Disabled</option>
                            <option value="when-importing">Only When Importing</option>
                            <option value="always">Always</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="simplifyIds" class="col-12 col-sm-6 col-form-label">Simplify IDs</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="simplifyIds" v-model="settings.json.simplifyIds">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="formatOutput" class="col-12 col-sm-6 col-form-label">Format Generated JSON</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="formatOutput" v-model="settings.json.formatOutput">
                            <option value="disabled">Disabled</option>
                            <option value="tabs">With Tabs</option>
                            <option value="spaces">With Spaces</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.json.formatOutput === 'spaces'">
                    <label for="formatOutputSpaces" class="col-12 col-sm-6 col-form-label sub-option-label">Spaces Per
                        Indent</label>
                    <div class="col-12 col-sm-6">
                        <input type="number" min="0" step="1" class="form-control" id="formatOutputSpaces"
                            v-model="settings.json.formatOutputSpaces" />
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Ruler" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="separateBaseCarrierSpeed" class="col-12 col-sm-6 col-form-label">Separate Default Ruler
                        Base
                        Carrier Speed</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="separateBaseCarrierSpeed"
                            v-model="settings.ruler.separateBaseCarrierSpeed">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1" v-if="settings.ruler.separateBaseCarrierSpeed === 'enabled'">
                    <label for="rulerBaseCarrierSpeed" class="col-12 col-sm-6 col-form-label">Default Ruler Base Carrier
                        Speed</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="rulerBaseCarrierSpeed"
                            v-model="settings.ruler.rulerBaseCarrierSpeed">
                            <option value="1">Crazy Slow (0.02 ly/tick)</option>
                            <option value="2.5">Very Slow (0.05 ly/tick)</option>
                            <option value="5">Slow (0.1 ly/tick)</option>
                            <option value="10">Standard (0.2 ly/tick)</option>
                            <option value="15">Fast (0.3 ly/tick)</option>
                            <option value="20">Very Fast (0.4 ly/tick)</option>
                            <option value="25">Crazy Fast (0.5 ly/tick)</option>
                        </select>
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Confirmations" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="confirmDeleteStar" class="col-12 col-sm-6 col-form-label">Confirm Delete Star</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="confirmDeleteStar"
                            v-model="settings.confirmations.confirmDeleteStar">
                            <option value="disabled">Disabled</option>
                            <option value="when-deleting-carriers">When Deleting Carriers</option>
                            <option value="always">Always</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="confirmDeleteCarrier" class="col-12 col-sm-6 col-form-label">Confirm Delete
                        Carrier</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="confirmDeleteCarrier"
                            v-model="settings.confirmations.confirmDeleteCarrier">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="confirmDeletePlayer" class="col-12 col-sm-6 col-form-label">Confirm Delete
                        Player</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="confirmDeletePlayer"
                            v-model="settings.confirmations.confirmDeletePlayer">
                            <option value="disabled">Disabled</option>
                            <option value="when-deleting-carriers">When Deleting Carriers</option>
                            <option value="always">Always</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="confirmDeleteTeam" class="col-12 col-sm-6 col-form-label">Confirm Delete Team</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="confirmDeleteTeam"
                            v-model="settings.confirmations.confirmDeleteTeam">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="confirmTransferPlayers" class="col-12 col-sm-6 col-form-label">Confirm Transfer
                        Players</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="confirmTransferPlayers"
                            v-model="settings.confirmations.confirmTransferPlayers">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
            </collapse-panel>

            <collapse-panel title="Technical" :starts-expanded="true">
                <div class="row pt-1 pb-1">
                    <label for="performanceMonitor" class="col-12 col-sm-6 col-form-label">Performance Monitor</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="performanceMonitor"
                            v-model="settings.technical.performanceMonitor">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="chunkVisualizer" class="col-12 col-sm-6 col-form-label">Chunk Visualizer</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="chunkVisualizer" v-model="settings.technical.chunkVisualizer">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
                <div class="row pt-1 pb-1">
                    <label for="allowChangeId" class="col-12 col-sm-6 col-form-label">Allow Changing IDs</label>
                    <div class="col-12 col-sm-6">
                        <select class="form-control" id="allowChangeId" v-model="settings.technical.allowChangeId">
                            <option value="disabled">Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
            </collapse-panel>

            <div class="text-danger" v-if="errors.length">
                <p>
                    Please correct the following error(s):
                </p>
                <ul>
                    <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
                </ul>
            </div>

            <div class="row mt-2">
                <div class="col"></div>
                <div class="col-auto" id="button-col">
                    <button type="submit" class="btn btn-success"><i class="fas fa-save"></i>
                        Save Settings</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import type { Settings } from '@/scripts/types/Settings';
import MenuTitle from './MenuTitle.vue';
import { useMenuStateStore } from '@/stores/menuState';
import storage from '@/scripts/storage';
import editor from '@/scripts/editor';
import { useGalaxyStore } from '@/stores/galaxy';
import helper from '@/scripts/helper';
import { useSpecialistsStore } from '@/stores/specialists';
import CollapsePanel from './CollapsePanel.vue';

export default {
    components: {
        'menu-title': MenuTitle,
        'collapse-panel': CollapsePanel
    },
    data() {
        return {
            settings: JSON.parse(JSON.stringify(storage.getSettings())) as Settings,
            errors: [] as Array<string>,
            starSelectionSpecialists: helper.selectionSpecialists(useSpecialistsStore().getValidStarSpecialists()),
            carrierSelectionSpecialists: helper.selectionSpecialists(useSpecialistsStore().getValidCarrierSpecialists())
        }
    },
    methods: {
        submit(e: Event) {
            if (!useGalaxyStore().$state.galaxyIsReady) return;

            if (this.validate(e)) {
                this.saveSettings();
                useGalaxyStore().setGalaxyIsReady(false);
                useMenuStateStore().setMenuState('none');
                editor.viewport!.visible = false;
                editor.viewport!.interactive = false;
                editor.viewport!.interactiveChildren = false;
                editor.clearScaleBar();
                editor.clearPerformanceMonitor();
                editor.clearCursorCoordinates();
                setTimeout(() => editor.reloadGalaxy(storage.getSettings()), 100);
            }
        },
        saveSettings() {
            storage.saveSettings(this.settings);
            storage.loadSettings();
        },
        validate(e: Event) {
            this.errors = [];

            // If any complex validation needs to be done

            return true;
        }
    }
}
</script>

<style scoped>
h5 {
    font-weight: 600;
    font-size: 18px;
    color: white;
    margin: 0;
}

.col-form-label {
    font-weight: 300;
    font-size: 14px;
    line-height: 1.5;
    padding-top: calc(.375rem + 1px);
    padding-bottom: calc(.375rem + 1px);
    padding-right: 0;
    margin-bottom: 0;
}

.row {
    width: auto;
    margin-left: inherit;
}

.sub-option-label {
    padding-left: 32px;
}

.btn {
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: .875rem;
    border-radius: 4px;
    margin-bottom: 6px;
}

.text-danger {
    font-size: 14px;
    font-weight: 400;
}

p {
    margin-bottom: 0;
}
</style>
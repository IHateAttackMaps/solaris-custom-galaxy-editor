import { EventEmitter } from "events";
import seededRandom from 'random-seed';
import { Application, BitmapText, Circle, Container, Graphics, Sprite, Ticker, type TickerCallback } from "pixi.js";
import type { Planet } from "./types/Planet";
import type { NaturalResources, Star } from "./types/Star";
import TextureService from "./texture";
import helper from "./helper";
import type { Settings } from "./types/Settings";
import { useGalaxyStore } from "@/stores/galaxy";

class StarObject extends EventEmitter {
    static culling_margin = 16;
    static nameSize = 4;
    static shipsSmallSize = 6;
    static shipsBigSize = 10;
    static maxLod = 4;
    static seededRNG = seededRandom.create();

    static zoomLevelDefinitions = {
        infrastructure: 200,
        id: 160,
        resources: 160,
        shipCount: 120
    };

    app;
    fixedContainer;
    container;
    graphics_shape_part: Sprite;
    graphics_shape_full: Sprite;
    graphics_shape_part_warp: Sprite;
    graphics_shape_full_warp: Sprite;
    graphics_hyperspaceRange;
    graphics_natural_resources_ring;
    graphics_scanningRange;
    graphics_star: Sprite;
    graphics_targeted;
    graphics_selected;
    graphics_kingOfTheHill;
    planets: Planet[] | null;
    handleOrbitPlanetsStep: TickerCallback<unknown> | null;
    isSelected;
    isMouseOver;
    zoomPercent;
    zoomDepth;
    pulsarGraphics: Graphics | null;
    wormHoleSprite: Sprite | null;
    asteroidFieldSprite: Sprite | null;
    specialistSprite: Sprite | null;
    container_planets: Container | null;
    container_nebula: Container | null;
    text_name: BitmapText | null;
    text_ships_small: BitmapText | null;
    text_ships_big: BitmapText | null;
    text_infrastructure: BitmapText | null;
    text_natural_resources: BitmapText | null;

    data: Star | null;
    lightYearDistance: number;
    userSettings: Settings | null;

    clampedScaling: boolean;
    baseScale: number;
    minScale: number;
    maxScale: number;

    constructor(app: Application) {
        super();

        this.app = app;
        this.fixedContainer = new Container(); // this container isn't affected by culling or user setting scalling
        this.fixedContainer.interactiveChildren = false;
        this.fixedContainer.eventMode = 'none';
        //this.fixedContainer.sortableChildren = true;
        //this.fixedContainer.zIndex = 0;
        this.container = new Container();
        this.container.cursor = 'pointer';
        this.container.eventMode = 'static';
        this.container.interactiveChildren = false;
        //this.container.sortableChildren = true;
        this.container.zIndex = 0;

        this.graphics_shape_part = new Sprite();
        this.graphics_shape_full = new Sprite();
        this.graphics_shape_part_warp = new Sprite();
        this.graphics_shape_full_warp = new Sprite();
        this.graphics_hyperspaceRange = new Graphics();
        this.graphics_natural_resources_ring = new Array(StarObject.maxLod);
        this.graphics_scanningRange = new Graphics();
        this.graphics_star = new Sprite();
        this.graphics_targeted = new Graphics();
        this.graphics_selected = new Graphics();
        this.graphics_kingOfTheHill = new Graphics();
        this.pulsarGraphics = null;
        this.wormHoleSprite = null;
        this.asteroidFieldSprite = null;
        this.specialistSprite = null;
        this.container_planets = null;
        this.container_nebula = null;
        this.text_name = null;
        this.text_ships_small = null;
        this.text_ships_big = null;
        this.text_infrastructure = null;
        this.text_natural_resources = null;

        this.container.addChild(this.graphics_star);
        this.container.addChild(this.graphics_shape_part);
        this.container.addChild(this.graphics_shape_full);
        this.container.addChild(this.graphics_shape_part_warp);
        this.container.addChild(this.graphics_shape_full_warp);
        this.container.addChild(this.graphics_targeted);
        this.container.addChild(this.graphics_selected);
        this.container.addChild(this.graphics_kingOfTheHill);

        this.fixedContainer.addChild(this.graphics_scanningRange);
        this.fixedContainer.addChild(this.graphics_hyperspaceRange);

        this.container.on('pointerup', this.onClicked.bind(this));
        this.container.on('mouseover', this.onMouseOver.bind(this));
        this.container.on('mouseout', this.onMouseOut.bind(this));

        this.planets = null;
        this.handleOrbitPlanetsStep = null;

        this.isSelected = false;
        this.isMouseOver = false;
        this.zoomPercent = 100;

        /*
        This is a value ranging from 1 to 4
        1: Display stars only
        2: Display shipcounts and orbit
        3: Display shipcount, orbit and name
        4: Display shipcount, orbit, name and infrastructure

        What zoompercentage corresponds with what depth level
        can be read from static property "zoomLevelDefinitions"
        */
        this.zoomDepth = 1;

        this.data = null;
        this.userSettings = null;

        this.lightYearDistance = NaN;
        this.clampedScaling = false;
        this.baseScale = 1;
        this.minScale = 8;
        this.maxScale = 16;
    }

    _getStarPlayer() {
        if (this.data!.playerId == null) return;
        return helper.getPlayerById(this.data!.playerId);
    }

    _getStarCarriers() {
        return helper.getCarriersOrbitingStar(this.data!);
    }

    _getStarCarrierShips() {
        return this._getStarCarriers().reduce((sum, c) => sum + (c.ships || 0), 0);
    }

    setup(data: Star, userSettings: Settings, lightYearDistance: number, interactive: boolean = true) {
        this.data = data;
        this.lightYearDistance = lightYearDistance;
        this.container.position.x = this.data!.location.x;
        this.container.position.y = this.data!.location.y;
        this.fixedContainer.position.x = this.data!.location.x;
        this.fixedContainer.position.y = this.data!.location.y;
        this.container.hitArea = new Circle(0, 0, 15);

        this.userSettings = userSettings;

        this.clampedScaling = this.userSettings!.visual.objectScaling === 'clamped';
        this.baseScale = 1;
        //divide these by 4 to allow more control while keeping the UI as int
        this.minScale = this.userSettings!.visual.objectMinimumScale / 4.0;
        this.maxScale = this.userSettings!.visual.objectMaximumScale / 4.0;

        StarObject.zoomLevelDefinitions = userSettings!.visual.zoomLevels.star;

        if (!interactive) {
            this.container.eventMode = 'passive';
            this.container.cursor = undefined;
        }
    }

    updateShips() {
        this.drawShips();
        this.drawName();
        this.updateVisibility();
    }

    updateId(id: string) {
        this.data!.id = id;
        this.drawName();
        this.updateVisibility();
    }

    updatePosition() {
        this.container.position.x = this.data!.location.x;
        this.container.position.y = this.data!.location.y;
        this.fixedContainer.position.x = this.data!.location.x;
        this.fixedContainer.position.y = this.data!.location.y;
    }

    draw() {
        // Note: The star may become visible/hidden due to changing scanning range.
        // If a star is revealed or a star becomes masked then we want to  the entire
        // star to be re-drawn.
        this.drawKingOfTheHillCircle();
        this.drawWormHole();
        this.drawPulsar();
        this.drawNebula();
        this.drawAsteroidField();
        this.drawTarget();
        this.drawSelectedCircle();
        this.drawStar();
        this.drawSpecialist();
        this.drawPlanets();
        this.drawNaturalResourcesRing();
        this.drawNaturalResourcesText();
        this.drawColour();
        this.drawScanningRange();
        this.drawHyperspaceRange();
        this.drawName();
        this.drawShips();
        this.drawInfrastructure();
    }


    drawStar() {
        this.container.removeChild(this.graphics_star);

        // ---- Binary stars ----
        if (this.isBinaryStar()) {
            if (this.hasBlackHole()) {
                this.graphics_star = new Sprite(TextureService.STAR_SYMBOLS['black_hole_binary']);
            } else if (this._isDeadStar()) {
                this.graphics_star = new Sprite(TextureService.STAR_SYMBOLS['binary_unscannable']);
            } else {
                this.graphics_star = new Sprite(TextureService.STAR_SYMBOLS['binary_scannable']);
            }
        }
        // ---- Non binary stars ----
        else if (this.hasBlackHole()) {
            this.graphics_star = new Sprite(TextureService.STAR_SYMBOLS['black_hole']);
        } else if (this._isDeadStar()) {
            this.graphics_star = new Sprite(TextureService.STAR_SYMBOLS['unscannable']);
        } else if (this.data!.homeStar) {
            this.graphics_star = new Sprite(TextureService.STAR_SYMBOLS['home']);
        } else {
            this.graphics_star = new Sprite(TextureService.STAR_SYMBOLS['scannable']);
        }

        if (helper.isRedCapital(this.data!)) {
            this.graphics_star.tint = 0xFF0000;
        }

        this.graphics_star.anchor.set(0.5);
        this.graphics_star.width = 24.0 / 2.0;
        this.graphics_star.height = 24.0 / 2.0;
        this.graphics_star.zIndex = 1;

        this.container.addChild(this.graphics_star);
    }

    drawPulsar() {
        if (this.pulsarGraphics) {
            this.container.removeChild(this.pulsarGraphics);
            this.pulsarGraphics = null;
        }

        if (!this.isPulsar()) {
            return;
        }

        const seed = this.data!.id;
        StarObject.seededRNG.seed(seed);

        const player = this._getStarPlayer();
        const playerColour = player ? helper.getPlayerById(player.id)!.colour.value : 0xFFFFFF;

        this.pulsarGraphics = new Graphics();
        this.pulsarGraphics.zIndex = -1;
        this.pulsarGraphics.moveTo(0, -20);
        this.pulsarGraphics.lineTo(0, 20);
        this.pulsarGraphics.ellipse(-5, 0, 5, 5);
        this.pulsarGraphics.ellipse(5, 0, 5, 5);
        this.pulsarGraphics.ellipse(-8, 0, 8, 8);
        this.pulsarGraphics.ellipse(8, 0, 8, 8);
        this.pulsarGraphics.stroke({ width: 1, color: playerColour, alpha: 0.5 });
        this.pulsarGraphics.rotation = StarObject.seededRNG.random() * Math.PI * 2.0;

        this.container.addChild(this.pulsarGraphics);
    }

    drawNebula() {
        if (this.container_nebula) {
            this.fixedContainer.removeChild(this.container_nebula);
            this.container_nebula = null;
        }

        if (!this.hasNebula()) {
            return;
        }

        if (!this.container_nebula) {
            this.container_nebula = new Container();
            const seed = this.data!.id;
            StarObject.seededRNG.seed(seed);
            const nebulaTexture = TextureService.getRandomStarNebulaTexture(seed);
            const nebulaSprite = new Sprite(nebulaTexture);

            const spriteSize = 64;
            nebulaSprite.width = spriteSize;
            nebulaSprite.height = spriteSize;
            nebulaSprite.anchor.set(0.5);
            nebulaSprite.rotation = StarObject.seededRNG.random() * Math.PI * 2.0;
            //nebulaSprite.zIndex = -2;

            const player = this._getStarPlayer();
            const playerColour = player ? helper.getPlayerById(player.id)!.colour.value : 0xFFFFFF;
            nebulaSprite.tint = playerColour;

            const blendSprite = new Sprite(nebulaTexture);
            blendSprite.width = spriteSize;
            blendSprite.height = spriteSize;
            blendSprite.anchor.set(0.5);
            blendSprite.rotation = StarObject.seededRNG.random() * Math.PI * 2.0;
            blendSprite.tint = playerColour;
            //blendSprite.zIndex = -2;

            this.container_nebula.addChild(nebulaSprite);
            this.container_nebula.addChild(blendSprite);

            this.fixedContainer.addChild(this.container_nebula);
        }
    }

    drawWormHole() {
        if (this.wormHoleSprite) {
            this.fixedContainer.removeChild(this.wormHoleSprite);
            this.wormHoleSprite = null;
        }

        if (!this.data!.wormHoleToStarId) {
            return;
        }

        this.wormHoleSprite = new Sprite(TextureService.getRandomWormholeTexture());

        const spriteSize = 40;
        this.wormHoleSprite.width = spriteSize;
        this.wormHoleSprite.height = spriteSize;
        this.wormHoleSprite.anchor.set(0.5);
        this.wormHoleSprite.rotation = Math.random() * Math.PI * 2.0;
        this.wormHoleSprite.alpha = 0.35;

        const player = this._getStarPlayer();
        const playerColour = player ? helper.getPlayerById(player.id)!.colour.value : 0xFFFFFF;
        this.wormHoleSprite.tint = playerColour;
        //this.wormHoleSprite.zIndex = -3;

        this.fixedContainer.addChild(this.wormHoleSprite);
    }

    drawAsteroidField() {
        if (this.asteroidFieldSprite) {
            this.fixedContainer.removeChild(this.asteroidFieldSprite);
            this.asteroidFieldSprite = null;
        }

        if (!this.hasAsteroidField()) {
            return;
        }

        const seed = this.data!.id;
        StarObject.seededRNG.seed(seed);
        const texture = TextureService.getRandomStarAsteroidFieldTexture(seed);
        this.asteroidFieldSprite = new Sprite(texture);

        const spriteSize = 64
        this.asteroidFieldSprite.width = spriteSize;
        this.asteroidFieldSprite.height = spriteSize;
        this.asteroidFieldSprite.anchor.set(0.5);
        this.asteroidFieldSprite.rotation = StarObject.seededRNG.random() * Math.PI * 2.0;

        const player = this._getStarPlayer();
        const playerColour = player ? helper.getPlayerById(player.id)!.colour.value : 0xFFFFFF;
        this.asteroidFieldSprite.tint = playerColour;
        //this.asteroidFieldSprite.zIndex = -1;

        this.fixedContainer.addChild(this.asteroidFieldSprite);
    }

    drawSpecialist() {
        if (this.specialistSprite) {
            this.container.removeChild(this.specialistSprite);
            this.specialistSprite = null;
        }

        if (!this.hasSpecialist()) {
            return;
        }

        const specialistTexture = TextureService.getSpecialistTexture(this.data!.specialist!.key);
        this.specialistSprite = new Sprite(specialistTexture);

        this.specialistSprite.width = 10;
        this.specialistSprite.height = 10;
        this.specialistSprite.x = -5;
        this.specialistSprite.y = -5;
        this.specialistSprite.tint = 0xFFFFFF;

        if (helper.isRedCapital(this.data!)) {
            this.specialistSprite.tint = 0xFF0000;
        }

        this.container.addChild(this.specialistSprite);
    }

    hasNebula() {
        return this.data!.isNebula;
    }

    hasAsteroidField() {
        return this.data!.isAsteroidField;
    }

    hasBlackHole() {
        return this.data!.isBlackHole;
    }

    isBinaryStar() {
        return this.data!.isBinaryStar;
    }

    isPulsar() {
        return this.data!.isPulsar;
    }

    hasSpecialist() {
        return this.data!.specialistId && this.data!.specialistId > 0 && this.data!.specialist;
    }

    drawPlanets() {
        if (this.container_planets) {
            this.unsubscribeToEvents();
            this.container.removeChild(this.container_planets);
            this.container_planets = null;
            this.planets = null;
        }

        if (this.userSettings!.visual.resources !== 'planets') return;

        if (!this.container_planets) {
            this.container_planets = new Container();

            // The more resources a star has the more planets it has.
            const planetCount = this._getPlanetsCount();

            if (planetCount === 0) {
                return;
            }

            const player = this._getStarPlayer();
            const playerColour = player ? helper.getPlayerById(player.id)!.colour.value : 0xFFFFFF;

            const rotationDirection = this._getPlanetOrbitDirection();
            const rotationSpeedModifier = this._getPlanetOrbitSpeed();

            this.planets = [];

            for (let i = 0; i < planetCount; i++) {
                const planetContainer = new Container();

                const distanceToStar = 15 + (5 * i);
                const planetSize = Math.floor(Math.abs(this.data!.location.y) + distanceToStar) % 1.5 + 0.5;

                const orbitGraphics = new Graphics();
                orbitGraphics.alpha = this.userSettings!.visual.resourcesRingOpacity;
                orbitGraphics.circle(0, 0, distanceToStar - (planetSize / 2));
                orbitGraphics.stroke({ width: 0.3, color: 0xFFFFFF });
                this.container_planets!.addChild(orbitGraphics);

                const planetGraphics = new Graphics();
                planetGraphics.circle(planetSize / 2, 0, planetSize);
                planetGraphics.fill(playerColour);

                if (!true) {
                    planetGraphics.alpha = 0.3;
                }

                planetContainer.addChild(planetGraphics);

                planetContainer.pivot.set(distanceToStar, 0);

                const rotationSpeed = (planetCount - i) / rotationSpeedModifier;

                this.container_planets!.addChild(planetContainer);

                this.planets.push({
                    index: i,
                    container: planetContainer,
                    rotationSpeed,
                    rotationDirection
                });
            }

            this.subscribeToEvents();

            this.container.addChild(this.container_planets);
        }
    }

    enableInteractivity() {
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
    }

    disableInteractivity() {
        this.container.eventMode = 'passive';
        this.container.cursor = undefined;
    }

    orbitPlanentsStep(ticker: Ticker) {
        if (!this.planets) {
            return;
        }

        const delta = ticker.deltaTime;
        for (const planet of this.planets) {
            if (planet.rotationDirection) {
                planet.container.rotation += planet.rotationSpeed * delta;
            } else {
                planet.container.rotation -= planet.rotationSpeed * delta;
            }
        }
    }

    drawNaturalResourcesRing() {
        if (!this.data!.naturalResources) {
            return;
        }

        for (let lod = 0; lod < StarObject.maxLod; lod += 1) {
            if (!this.graphics_natural_resources_ring[lod]) {
                this.graphics_natural_resources_ring[lod] = new Graphics();
                this.graphics_natural_resources_ring[lod].alpha = 0.5;
                this.graphics_natural_resources_ring[lod].zIndex = -1;
            }
            this.graphics_natural_resources_ring[lod].clear();

            if (this.userSettings!.visual.resources !== 'single-ring') {
                return;
            }

            const averageNaturalResources = this._calculateAverageNaturalResources(this.data!.naturalResources);

            let ringRadius = averageNaturalResources <= 50 ? averageNaturalResources : averageNaturalResources > 400 ? 100 : (12.5 * Math.log2(averageNaturalResources / 50) + 50);

            ringRadius /= 8.0;
            let lineWidth = 1.0 / 8.0;
            ringRadius *= lod + 1;
            lineWidth *= lod + 1;
            this.graphics_natural_resources_ring[lod].clear();
            this.graphics_natural_resources_ring[lod].circle(0, 0, ringRadius * 0.75);
            this.graphics_natural_resources_ring[lod].stroke({ width: lineWidth, color: 0xFFFFFF, alpha: this.userSettings!.visual.resourcesRingOpacity });
            this.graphics_natural_resources_ring[lod].scale = 1.0 / ((1.0 / 8.0) * (lod + 1));
            this.container.addChild(this.graphics_natural_resources_ring[lod]);
        }
    }

    drawNaturalResourcesText() {
        if (this.text_natural_resources) {
            this.container.removeChild(this.text_natural_resources);
            this.text_natural_resources = null;
        }

        if (this.userSettings!.visual.resources !== 'numbers') return;

        if (
            !this.data!.naturalResources ||
            (this.data!.naturalResources.economy == null || this.data!.naturalResources.industry == null || this.data!.naturalResources.science == null)
        ) return;

        let displayNaturalResources;

        const isSplitNaturalResources = useGalaxyStore().$state.isSplitNaturalResources;
        if (isSplitNaturalResources) {
            displayNaturalResources = `${this.data!.naturalResources.economy} ${this.data!.naturalResources.industry} ${this.data!.naturalResources.science}`;
        } else displayNaturalResources = `${this.data!.naturalResources.economy}`;

        this.text_natural_resources = new BitmapText({
            text: displayNaturalResources,
            style: {
                fontFamily: 'chakrapetch',
                fontSize: 4
            }
        });

        this.text_natural_resources.x = -(this.text_natural_resources.width / 2.0);
        if (this.data!.warpGate) {
            this.text_natural_resources.y = 15;
        } else this.text_natural_resources.y = 12;
        this.text_natural_resources.alpha = 1;
        //this.text_natural_resources.zIndex = 1

        this.container.addChild(this.text_natural_resources);
    }

    _calculateAverageNaturalResources(naturalResources: NaturalResources) {
        return Math.floor((naturalResources.economy + naturalResources.industry + naturalResources.science) / 3);
    }

    _getPlanetsCount() {
        if (!this.data!.naturalResources) {
            return 0;
        }
        const averageNaturalResources = this._calculateAverageNaturalResources(this.data!.naturalResources);
        return Math.min(Math.floor(averageNaturalResources / 45 * 3), 5); // Anything over 45 gets 3 planets
    }

    _getPlanetOrbitDirection() {
        return Math.floor(Math.abs(this.data!.location.y)) % 2 === 0;
    }

    _getPlanetOrbitSpeed() {
        return Math.floor(Math.random() * (1000 - 500 + 1) + 500); // Random number between 500 and 1000
    }

    drawColour() {
        if (this.graphics_shape_part) {
            this.container.removeChild(this.graphics_shape_part);
            this.container.removeChild(this.graphics_shape_full);
        }

        // Get the player who owns the star.
        const player = this._getStarPlayer();

        if (!player) {
            return;
        }

        if (Object.keys(TextureService.PLAYER_SYMBOLS).includes(player.shape)) {
            this.graphics_shape_part = new Sprite(TextureService.PLAYER_SYMBOLS[player.shape][2 + (this.data!.warpGate ? 1 : 0)]);
            this.graphics_shape_full = new Sprite(TextureService.PLAYER_SYMBOLS[player.shape][0 + (this.data!.warpGate ? 1 : 0)]);
        } else return;

        const playerColour = helper.getPlayerById(player.id)!.colour.value;

        this.graphics_shape_part.tint = playerColour;
        this.graphics_shape_full.tint = playerColour;
        this.graphics_shape_part.anchor.set(0.5);
        this.graphics_shape_full.anchor.set(0.5);
        this.graphics_shape_part.width = 28.0;
        this.graphics_shape_part.height = 28.0;
        this.graphics_shape_full.width = 28.0;
        this.graphics_shape_full.height = 28.0;
        this.container.addChild(this.graphics_shape_part);
        this.container.addChild(this.graphics_shape_full);
    }

    drawName() {
        if (this.text_name) {
            this.container.removeChild(this.text_name);
            this.text_name = null;
        }

        if (!this.text_name) {
            this.text_name = new BitmapText({
                text: this.data!.id,
                style: {
                    fontFamily: 'chakrapetch',
                    fontSize: StarObject.nameSize
                }
            });
            this.text_name.x = 5;
            this.container.addChild(this.text_name);
        }

        const totalKnownShips = (this.data!.ships || 0) + this._getStarCarrierShips();
        const carriersOrbiting = this._getStarCarriers();

        if ((this.data!.playerId || carriersOrbiting) && (totalKnownShips > 0 || carriersOrbiting.length > 0)) {
            this.text_name.y = ((StarObject.nameSize + StarObject.shipsSmallSize) / 2.0) - StarObject.nameSize;
        } else {
            this.text_name.y = -(this.text_name.height / 2);
        }
    }

    drawShips() {
        if (this.text_ships_small) {
            this.container.removeChild(this.text_ships_small);
            this.text_ships_small = null;
        }
        if (this.text_ships_big) {
            this.container.removeChild(this.text_ships_big);
            this.text_ships_big = null;
        }

        const totalShips = (this.data!.ships || 0) + this._getStarCarrierShips();

        const carriersOrbiting = this._getStarCarriers();
        const carrierCount = carriersOrbiting.length;

        let shipsText = '';

        if (this.data!.playerId || carriersOrbiting) {

            if (totalShips !== 0) {
                shipsText = totalShips.toString();
            }

            if (carrierCount) {
                shipsText += '/';
                shipsText += carrierCount.toString();

                if (helper.isStarHasMultiplePlayersInOrbit(this.data!)) {
                    shipsText += '+';
                }
            }
        }

        if (shipsText) {
            if (!this.text_ships_small) {
                this.text_ships_small = new BitmapText({
                    text: this.data!.id,
                    style: {
                        fontFamily: 'chakrapetch',
                        fontSize: StarObject.shipsSmallSize
                    }
                });
                //this.text_ships_small.zIndex = 2;
                this.container.addChild(this.text_ships_small);
                this.text_ships_small.x = 5;
                this.text_ships_small.y = (-this.text_ships_small.height) + (((StarObject.nameSize + StarObject.shipsSmallSize) / 2.0) - StarObject.nameSize);
            }

            if (!this.text_ships_big) {
                this.text_ships_big = new BitmapText({
                    text: this.data!.id,
                    style: {
                        fontFamily: 'chakrapetch',
                        fontSize: StarObject.shipsBigSize
                    }
                });
                //this.text_ships_big.zIndex = 2;
                this.container.addChild(this.text_ships_big);
                this.text_ships_big.x = 5;
                this.text_ships_big.y = -this.text_ships_big.height / 2.0;
            }
            this.text_ships_small.text = shipsText;
            this.text_ships_big.text = shipsText;
        }
    }

    drawInfrastructure() {
        if (this.text_infrastructure) {
            this.container.removeChild(this.text_infrastructure);
            this.text_infrastructure = null;
        }

        if (this.data!.infrastructure && (this.data!.infrastructure.economy == null || this.data!.infrastructure.industry == null || this.data!.infrastructure.science == null)) {
            return;
        }

        if (!this.text_infrastructure) {
            if (this.data!.infrastructure) {
                const displayInfrastructure = `${this.data!.infrastructure.economy} ${this.data!.infrastructure.industry} ${this.data!.infrastructure.science}`;

                this.text_infrastructure = new BitmapText({
                    text: displayInfrastructure,
                    style: {
                        fontFamily: 'chakrapetch',
                        fontSize: 4
                    }
                });
                this.text_infrastructure.x = -(this.text_infrastructure.width / 2.0);
                if (this.data!.warpGate) {
                    this.text_infrastructure.y = -18;
                } else this.text_infrastructure.y = -15;
                //this.text_infrastructure.zIndex = 1;

                this.container.addChild(this.text_infrastructure);
            }
        }
    }

    drawScanningRange() {
        this.graphics_scanningRange.clear();

        // Get the player who owns the star.
        const player = this._getStarPlayer();

        // Dead stars do not have scanning range
        if (!player || this._isDeadStar()) { return; }

        let radius = 0;
        const effectiveTechs = helper.getEffectiveTechs(this.data!);
        if (effectiveTechs?.scanning != null) {
            radius = ((effectiveTechs.scanning || 1) + 1) * this.lightYearDistance;
        } else return;

        this.graphics_scanningRange.circle(0, 0, radius);
        this.graphics_scanningRange.fill({ color: helper.getPlayerById(player.id)!.colour.value, alpha: 0.075 });
        this.graphics_scanningRange.stroke({ width: 1, color: 0xFFFFFF, alpha: 0.2 });
        this.graphics_scanningRange.zIndex = -1;
        this.container.zIndex = -1;

        this.graphics_scanningRange.visible = this.isSelected;
    }

    drawHyperspaceRange() {
        this.graphics_hyperspaceRange.clear();

        if (!this.isSelected) {
            this.container.zIndex = 0;
        }

        // Get the player who owns the star.
        const player = this._getStarPlayer();

        if (!player) { return; }

        let radius = 0;
        const effectiveTechs = helper.getEffectiveTechs(this.data!);
        if (effectiveTechs?.hyperspace != null) {
            radius = ((effectiveTechs.hyperspace || 1) + 1.5) * this.lightYearDistance;
        } else return;

        this.graphics_hyperspaceRange.star(0, 0, radius, radius, radius - 3); // what
        this.graphics_hyperspaceRange.fill({ color: helper.getPlayerById(player.id)!.colour.value, alpha: 0.075 });
        this.graphics_hyperspaceRange.stroke({ width: 1, color: 0xFFFFFF, alpha: 0.2 });
        this.graphics_hyperspaceRange.zIndex = -1;
        this.container.zIndex = -1;

        this.graphics_hyperspaceRange.visible = this.isSelected;
    }

    _drawStar(graphics: Graphics, radius: number) {
        graphics.star!(0, 0, radius, radius, radius - 3);
    }

    drawTarget() {
        this.graphics_targeted.clear();

        if (this.data!.targeted) {
            this.graphics_targeted.moveTo(9, -9);
            this.graphics_targeted.lineTo(-9, 9);
            this.graphics_targeted.moveTo(-9, -9);
            this.graphics_targeted.lineTo(9, 9);
            this.graphics_targeted.closePath();
            this.graphics_targeted.stroke({ width: 2, color: 0xFF0000 });
        }
    }

    drawSelectedCircle(force: boolean = false) {
        this.graphics_selected.clear();

        if (this.isSelected) {
            this.graphics_selected.alpha = 0.3;
            this.graphics_selected.circle(0, 0, 20);
            this.graphics_selected.stroke({ width: 0.5, color: 0xFFFFFF });
        }

        if (force) {
            this.graphics_selected.alpha = 1;
            this.graphics_selected.circle(0, 0, 20);
            this.graphics_selected.stroke({ width: 0.5, color: 0xFFFFFF });
        }
    }

    drawKingOfTheHillCircle() {
        this.graphics_kingOfTheHill.clear();

        if (this.data!.isKingOfTheHillStar) {
            this.graphics_kingOfTheHill.alpha = 0.5;
            this.graphics_kingOfTheHill.circle(0, 0, 20);
            this.graphics_kingOfTheHill.stroke({ width: 0.5, color: 0xFFFFFF });
        }
    }

    onZoomChanging(zoomPercent: number, needToUpdate: boolean) {
        this.zoomPercent = zoomPercent;
        this.setScale(zoomPercent);
        if (needToUpdate) this.updateVisibility();
    }

    setScale(zoomPercent: number) {
        if (this.clampedScaling) {
            const currentScale = zoomPercent / 100;
            if (currentScale < this.minScale) {
                this.container.scale = { x: (1 / currentScale) * this.minScale, y: (1 / currentScale) * this.minScale };
            } else if (currentScale > this.maxScale) {
                this.container.scale = { x: (1 / currentScale) * this.maxScale, y: (1 / currentScale) * this.maxScale };
            }
            else {
                this.container.scale = { x: this.baseScale, y: this.baseScale };
            }
        }
        else {
            this.container.scale = { x: this.baseScale, y: this.baseScale };
        }
    }

    onClicked(e: any, tryMultiSelect = true) {
        const eventData = e ? e.data : null;

        const click = () => {
            this.emit('onStarClicked', {
                starData: this.data,
                tryMultiSelect,
                eventData,
                permitCallback: () => {
                    this.deselectAllText();

                    if (this._getStarPlayer()) {
                        this.updateVisibility();
                    }
                }
            });
        };

        if (e?.data?.originalEvent) {
            const button = e.data.originalEvent.button;

            if (button === 2) {
                this.emit('onStarRightClicked', {
                    starData: this.data,
                    eventData
                });
            } else if (button === 1) {
                this.emit('onStarDefaultClicked', {
                    starData: this.data,
                    eventData
                });
            } else {
                click();
            }
        } else {
            click();
        }
    }

    updateVisibility() {
        const aparentScale = this.container.scale.x * (this.zoomPercent / 100.0);
        const lod = Math.max(Math.min(Math.floor(aparentScale) - 1, StarObject.maxLod - 1), 0.0);
        for (let l = 0; l < StarObject.maxLod; l += 1) {
            const ring = this.graphics_natural_resources_ring[l];

            if (ring) {
                ring.visible = false;
            }
        }

        this.graphics_star.visible = !this.hasSpecialist();
        this.graphics_hyperspaceRange.visible = this.isSelected;
        this.graphics_scanningRange.visible = this.isSelected;

        if (this.userSettings!.visual.resources === 'single-ring') {
            if (this.graphics_natural_resources_ring[lod]) {
                this.graphics_natural_resources_ring[lod].visible = this.zoomPercent >= StarObject.zoomLevelDefinitions.resources;
            }
        }

        if (this.text_name) this.text_name.visible = this.isSelected || this.zoomPercent >= StarObject.zoomLevelDefinitions.id;
        if (this.container_planets) this.container_planets.visible = this.zoomPercent >= StarObject.zoomLevelDefinitions.resources;
        if (this.text_natural_resources) this.text_natural_resources.visible = this.zoomPercent >= StarObject.zoomLevelDefinitions.resources;
        if (this.text_infrastructure) this.text_infrastructure.visible = this.isSelected || this.zoomPercent >= StarObject.zoomLevelDefinitions.infrastructure;

        const small_ships = this.zoomPercent >= StarObject.zoomLevelDefinitions.id || this.isSelected;
        const visible_ships = !!(true && (this.isSelected || this.zoomPercent >= StarObject.zoomLevelDefinitions.shipCount));

        if (this.text_ships_small) this.text_ships_small.visible = small_ships && visible_ships;
        if (this.text_ships_big) this.text_ships_big.visible = !small_ships && visible_ships;

        const partial_ring = ((this.text_ships_big != null) && this.text_ships_big.visible)
            || ((this.text_ships_small != null) && this.text_ships_small.visible)
            || ((this.text_name != null) && this.text_name.visible);

        this.graphics_shape_part.visible = partial_ring;
        this.graphics_shape_full.visible = !partial_ring;
        this.graphics_shape_part_warp.visible = partial_ring && this.data!.warpGate;
        this.graphics_shape_full_warp.visible = !partial_ring && this.data!.warpGate;

    }

    subscribeToEvents() {
        if (this.container_planets) {
            this.handleOrbitPlanetsStep = this.orbitPlanentsStep.bind(this);
            this.app.ticker.add(this.handleOrbitPlanetsStep);
        }
    }

    unsubscribeToEvents() {
        if (this.container_planets) {
            this.app.ticker.remove(this.handleOrbitPlanetsStep!);
            this.handleOrbitPlanetsStep = null;
        }
    }

    deselectAllText() {
        if (window.getSelection) { window.getSelection()!.removeAllRanges(); }
        else if (document.getSelection()) { document.getSelection()?.empty(); }
    }

    onMouseOver(e: any) {
        this.isMouseOver = true;

        this.emit('onStarMouseOver', this);
    }

    onMouseOut(e: any) {
        this.isMouseOver = false;

        this.emit('onStarMouseOut', this);
    }

    refreshZoom(zoomPercent: number, needToUpdate: boolean) {
        this.zoomPercent = zoomPercent;
        if (needToUpdate) this.updateVisibility();
    }

    cleanUpEventHandlers() {
        this.container.off('pointerup', this.onClicked.bind(this));
        this.container.off('mouseover', this.onMouseOver.bind(this));
        this.container.off('mouseout', this.onMouseOut.bind(this));
    }

    destroy() {
        this.container.destroy();
        this.fixedContainer.destroy();
    }

    _isDeadStar() {
        return this.data!.naturalResources != null && this.data!.naturalResources.economy <= 0 && this.data!.naturalResources.industry <= 0 && this.data!.naturalResources.science <= 0;
    }

    select() {
        this.isSelected = true;
        this.drawSelectedCircle();
        this.emit('onSelected', this.data);
        this.updateVisibility();
    }

    unselect() {
        this.isSelected = false;
        this.drawSelectedCircle();
        this.emit('onUnselected', this.data);
        this.updateVisibility();
    }

    toggleSelected() {
        if (this.isSelected) {
            this.unselect();
        } else {
            this.select();
        }
    }
}

export default StarObject;
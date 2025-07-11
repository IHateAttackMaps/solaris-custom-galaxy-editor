import { Circle, Container, Graphics } from 'pixi.js';
import helper from './helper';
import { EventEmitter } from "events";
import type { Settings } from './types/Settings';
import type { Carrier } from './types/Carrier';
import Map from './map';
import type { Location } from './types/Location';
import type { CarrierWaypoint } from './types/CarrierWaypoint';
import { useGalaxyStore } from '@/stores/galaxy';

class Waypoints extends EventEmitter {
    container: Container;

    carrier: Carrier | null;
    lightYearDistance: number;
    userSettings: Settings | null;

    onWaypointCreatedHandler: any;
    onWaypointOutOfRangeHandler: any;

    constructor() {
        super();

        this.container = new Container();
        this.container.hitArea = new Circle(0, 0, 0);

        this.carrier = null;
        this.lightYearDistance = NaN;
        this.userSettings = null;
    }

    _getGalaxy() {
        return useGalaxyStore().$state.galaxy;
    }

    setup() {
        this.lightYearDistance = Map.lightYearDistance;
    }

    clear() {
        this.container.removeChildren();
    }

    draw(carrier: Carrier) {
        this.clear();

        this.carrier = carrier;

        this.drawHyperspaceRange();
        this.drawLastWaypoint();
        this.drawNextWaypoints();
        this.drawPaths();
    }

    drawLastWaypoint() {
        // If there are no waypoints at all
        // then deem the current location as the waypoint.
        const lastLocation = this._getLastLocation();
        if (lastLocation === null) throw new Error('Carrier lastLocation is null!');

        // Draw a big selected highlight around the last waypoint.
        this._highlightLocation(lastLocation, 0.8);
    }

    drawNextWaypoints() {
        // Draw all of the available waypoints that the last waypoint can reach.
        const lastLocation = this._getLastLocation();
        if (lastLocation === null) throw new Error('Carrier lastLocation is null!');

        // Calculate which stars are in reach and draw highlights around them
        const hyperspaceDistance = helper.getHyperspaceDistance(this.carrier!);

        for (let i = 0; i < this._getGalaxy().stars.length; i++) {
            const s = this._getGalaxy().stars[i];

            const distance = helper.getDistanceBetweenLocations(lastLocation, s.location);

            if (distance <= hyperspaceDistance) {
                this._highlightLocation(s.location, 0.5);
            } else {
                this._highlightLocation(s.location, 0.2);
            }
        }
    }

    drawPaths() {
        if (!this.carrier!.waypoints.length) {
            return;
        }

        // Draw all paths to each waypoint the carrier currently has.
        // Start with the first waypoint's source location and then
        // go through each waypoint draw a line to their destinations.

        const graphics = new Graphics();

        // Start the line from where the carrier currently is.
        let star;

        graphics.moveTo(this.carrier!.location.x, this.carrier!.location.y);

        // Draw a line to each destination along the waypoints.
        for (let i = 0; i < this.carrier!.waypoints.length; i++) {
            const waypoint = this.carrier!.waypoints[i];
            star = this._getGalaxy().stars.find(s => s.id === waypoint.destination);
            if (star == null) throw new Error("Carrier destination star is null!");

            graphics.lineTo(star.location.x, star.location.y);
            graphics.stroke({ width: 1, color: 0xFFFFFF, alpha: 0.8 });
        }

        this.container.addChild(graphics);
    }

    drawHyperspaceRange() {
        const graphics = new Graphics();

        const lastLocationStar = this._getLastLocationStar();
        if (lastLocationStar == null) throw new Error('Carrier lastLocationStar is null!');

        const radius = helper.getHyperspaceDistance(this.carrier!);

        const playerColour = helper.getPlayerById(this.carrier!.playerId)!.colour.value;

        graphics.star(lastLocationStar.location.x, lastLocationStar.location.y, radius, radius, radius - 3);
        graphics.fill({ color: playerColour, alpha: 0.15 });
        graphics.stroke({ width: 1, color: playerColour, alpha: 0.2 });

        this.container.addChild(graphics);
    }

    _highlightLocation(location: Location, opacity: number) {
        const graphics = new Graphics();
        const radius = 12;

        graphics.star(location.x, location.y, radius, radius, radius - 3);
        graphics.stroke({ width: 1, color: 0xFFFFFF, alpha: opacity });

        this.container.addChild(graphics);
    }

    onStarClicked(e: any) {
        if (!this.carrier) {
            return;
        }

        // If the selected star is inside of hyperspace range then
        // simply create a waypoint to it. Otherwise try to calculate the
        // shortest route to it.
        const hyperspaceDistance = helper.getHyperspaceDistance(this.carrier);

        const lastLocationStar = this._getLastLocationStar();
        if (lastLocationStar == null) throw new Error('Carrier lastLocationStar is null!');
        const lastLocation = lastLocationStar == null ? null : lastLocationStar.location;
        if (lastLocation === null) throw new Error('Carrier lastLocation is null!');

        const distance = helper.getDistanceBetweenLocations(lastLocation, e.location);

        let canCreateWaypoint = distance <= hyperspaceDistance;

        if (!canCreateWaypoint && lastLocationStar && lastLocationStar.wormHoleToStarId) {
            const wormHolePairStar = helper.getStarById(lastLocationStar.wormHoleToStarId);

            canCreateWaypoint = wormHolePairStar != null && wormHolePairStar.id === e.id;
        }

        if (canCreateWaypoint) {
            this._createWaypoint(e.id);
        } else {
            this._createWaypointRoute(lastLocationStar.id, e.id);
        }
    }

    _createWaypoint(destinationStarId: string) {
        const newWaypoint = {
            destination: destinationStarId,
            action: 'collectAll',
            actionShips: 0,
            delayTicks: 0,
            source: ''
        } as CarrierWaypoint;

        // If the carrier has waypoints, create a new waypoint from the last destination.
        if (this.carrier!.waypoints.length) {
            const lastWaypoint = this._getLastWaypoint();

            newWaypoint.source = lastWaypoint.destination;
        } else { // Otherwise use the current orbiting star
            if (this.carrier!.orbiting == null) throw new Error("A carrier with no waypoints must be orbiting a star!");
            newWaypoint.source = this.carrier!.orbiting;
        }

        this.carrier!.waypoints.push(newWaypoint);

        this.draw(this.carrier!);

        this.emit('onWaypointCreated', newWaypoint);
    }

    _createWaypointRoute(sourceStarId: string, destinStarId: string) {
        const route = helper.calculateShortestRoute(this.carrier!, sourceStarId, destinStarId);

        if (route.length > 1) {
            for (let i = 1; i < route.length; i++) {
                const waypointStar = route[i];

                this._createWaypoint(waypointStar.id);
            }
        } else {
            this.emit('onWaypointOutOfRange', null);
        }
    }

    _getLastWaypoint() {
        return this.carrier!.waypoints[this.carrier!.waypoints.length - 1];
    }

    _getLastLocation() {
        const lastLocationStar = this._getLastLocationStar(); // If carrier is validated properly, this should never be undefined.

        if (lastLocationStar) {
            return lastLocationStar.location;
        }

        return null;
    }

    _getLastLocationStar() {
        if (this.carrier!.waypoints.length) {
            const lastWaypointStarId = this.carrier!.waypoints[this.carrier!.waypoints.length - 1].destination;

            return this._getGalaxy().stars.find(s => s.id === lastWaypointStarId);
        } else {
            return this._getGalaxy().stars.find(s => s.id === this.carrier!.orbiting);
        }
    }
}

export default Waypoints;
import type { Specialist } from '@/scripts/types/Specialist';
import { defineStore } from 'pinia';

export const useSpecialistsStore = defineStore({
    id: 'specialists',
    state: () => ({
        carrier: [
            {
                id: 1,
                key: 'mecha-head',
                name: 'Admiral',
                description: 'Increases carrier speed by x1.5. Deducts -1 Weapons from your side in combat and -2 Hyperspace Range to the carrier.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 1.5,
                        weapons: -1,
                        hyperspace: -2
                    }
                }
            },
            {
                id: 2,
                key: 'mecha-mask',
                name: 'Lieutenant',
                description: 'Adds +1 Weapons to your side in combat. Deducts -1 Hyperspace Range from the carrier.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 200,
                baseCostCreditsSpecialists: 2,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        weapons: 1,
                        hyperspace: -1
                    }
                }
            },
            {
                id: 3,
                key: 'android-mask',
                name: 'Colonel',
                description: 'Adds +2 Weapons to your side in combat. Deducts -1 Hyperspace Range from the carrier and decreases carrier speed to x0.75.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        weapons: 2,
                        hyperspace: -1,
                        speed: 0.75
                    }
                }
            },
            {
                id: 4,
                key: 'hazmat-suit',
                name: 'General',
                description: 'Adds +3 Weapons to your side in combat. Deducts -1 Hyperspace Range from the carrier and decreases carrier speed to x0.5.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        weapons: 3,
                        hyperspace: -1,
                        speed: 0.5
                    }
                }
            },
            {
                id: 5,
                key: 'cyborg-face',
                name: 'Smuggler',
                description: 'Increased carrier speed by x2. Deducts -1 Weapons from your side in combat and -1 Hyperspace Range from the carrier.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 2,
                        hyperspace: -1,
                        weapons: -1
                    }
                }
            },
            {
                id: 6,
                key: 'lunar-module',
                name: 'Explorer',
                description: 'Adds +3 Hyperspace Range and increases carrier speed by x1.5. Deducts -3 Weapons from your side in combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 1.5,
                        hyperspace: 3,
                        weapons: -3
                    }
                }
            },
            {
                id: 7,
                key: 'spaceship',
                name: 'Destroyer',
                description: 'Adds +5 Weapons to your side in combat. Deducts -3 Hyperspace Range from the carrier and decreases carrier speed to x0.5.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 1000,
                baseCostCreditsSpecialists: 10,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        hyperspace: -3,
                        weapons: 5,
                        speed: 0.5
                    }
                }
            },
            {
                id: 8,
                key: 'power-generator',
                name: 'Scrambler',
                description: 'Prevents other players from seeing how many ships the carrier has.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        hideShips: true
                    }
                }
            },
            {
                id: 9,
                key: 'energise',
                name: 'Infiltrator',
                description: 'When participating in combat, deducts -1 Weapons from the opposing side.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        deductEnemyWeapons: 1
                    }
                }
            },
            {
                id: 10,
                key: 'afterburn',
                name: 'Warp Stabilizer',
                description: 'Warp Scramblers do not affect the carrier.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        unlockWarpGates: true
                    }
                }
            },
            {
                id: 11,
                key: 'strafe',
                name: 'Raider',
                description: 'Increases carrier speed by x2 and grants x2 star capture rewards for destroying infrastructure in combat. Deducts -2 Weapons from your side in combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 2,
                        weapons: -2
                    },
                    special: {
                        starCaptureRewardMultiplier: 2
                    }
                }
            },
            {
                id: 12,
                key: 'alien-stare',
                name: 'Coward',
                description: 'Increases carrier speed by x2 and the carrier does not participate in carrier-to-carrier combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 1000,
                baseCostCreditsSpecialists: 10,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 2
                    },
                    special: {
                        avoidCombatCarrierToCarrier: true
                    }
                }
            },
            {
                id: 13,
                key: 'pirate',
                name: 'Pirate',
                description: 'Adds +3 Weapons to your side in carrier-to-carrier combat and increases carrier speed by x1.5. Deducts -2 Weapons from your side in carrier-to-star combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 1.5,
                        carrierToCarrierCombat: {
                            weapons: 3
                        },
                        carrierToStarCombat: {
                            attacker: {
                                weapons: -2
                            },
                            defender: {
                                weapons: -2
                            }
                        }
                    }
                }
            },
            {
                id: 14,
                key: 'spoutnik',
                name: 'Pathfinder',
                description: 'Adds +1 Hyperspace Range to the carrier.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 100,
                baseCostCreditsSpecialists: 1,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        hyperspace: 1
                    }
                }
            },
            {
                id: 15,
                key: 'starfighter',
                name: 'Marauder',
                description: 'Increases carrier speed by x1.5 and the carrier does not participate in carrier-to-carrier combat. Deducts -1 Weapons to your side in combat and -2 Hyperspace Range from the carrier.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 1.5,
                        hyperspace: -2,
                        weapons: -1
                    },
                    special: {
                        avoidCombatCarrierToCarrier: true
                    }
                }
            },
            {
                id: 16,
                key: 'rocket',
                name: 'Stellar Bomb',
                description: 'Reignites a dead star with 25 Natural Resources (x2 for Binary Stars), the Stellar Bomb will be destroyed but the carrier will survive. Decreases carrier speed to x0.5.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 0.5
                    },
                    special: {
                        reigniteDeadStar: true,
                        reigniteDeadStarNaturalResources: {
                            economy: 25,
                            industry: 25,
                            science: 25
                        }
                    }
                }
            },
            {
                id: 17,
                key: 'ray-gun',
                name: 'Saboteur',
                description: 'When participating in combat, deducts -3 Weapons from the opposing side. Deducts -2 Hyperspace Range from the carrier and decreases carrier speed to x0.75.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 1000,
                baseCostCreditsSpecialists: 10,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        hyperspace: -2,
                        speed: 0.75
                    },
                    special: {
                        deductEnemyWeapons: 3
                    }
                }
            },
            {
                id: 18,
                key: 'vintage-robot',
                name: 'Joker',
                description: 'When attacking a star or in carrier-to-carrier combat, the calculated weapons technology levels are swapped between the two sides unless both sides have a Joker.',
                active: {
                    official: false,
                    custom: false
                },
                baseCostCredits: 1000,
                baseCostCreditsSpecialists: 10,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        combatSwapWeaponsTechnology: true
                    }
                }
            },
            {
                id: 19,
                key: 'megabot',
                name: 'War Hero',
                description: 'When attacking a star, adds +2 Weapons for each player on your side in combat. Decreases carrier speed to x0.75.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 400,
                baseCostCreditsSpecialists: 4,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        speed: 0.75,
                        carrierToStarCombat: {
                            attacker: {
                                weaponsPerAlly: 2
                            }
                        }
                    }
                }
            },
            {
                id: 20,
                key: 'forward-field',
                name: 'Siege Breaker',
                description: 'When attacking a star, adds +4 Weapons to your side in combat. Does not participate in carrier-to-carrier combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: 15,
                modifiers: {
                    local: {
                        carrierToStarCombat: {
                            attacker: {
                                weapons: 4
                            }
                        }
                    },
                    special: {
                        avoidCombatCarrierToCarrier: true
                    }
                }
            },
            {
                id: 21,
                key: 'bolter-gun',
                name: 'Plunderer',
                description: 'Grants x1.5 star capture rewards for destroying infrastructure in combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 200,
                baseCostCreditsSpecialists: 2,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        starCaptureRewardMultiplier: 1.5
                    }
                }
            }
        ] as Specialist[],
        star: [
            {
                id: 1,
                key: 'sattelite',
                name: 'Orbital Array',
                description: 'Adds +1 Scanning Range to the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 100,
                baseCostCreditsSpecialists: 1,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        scanning: 1
                    }
                }
            },
            {
                id: 2,
                key: 'airtight-hatch',
                name: 'Space Dock',
                description: 'Adds +2 Manufacturing to the star. Deducts -1 Terraforming from the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 200,
                baseCostCreditsSpecialists: 2,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        manufacturing: 2,
                        terraforming: -1
                    }
                }
            },
            {
                id: 3,
                key: 'cannister',
                name: 'Atmosphere Processor',
                description: 'Adds +3 Terraforming to the star. Deducts -1 Scanning from the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 200,
                baseCostCreditsSpecialists: 2,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        terraforming: 3,
                        scanning: -1
                    }
                }
            },
            {
                id: 4,
                key: 'defense-satellite',
                name: 'Orbital Cannon',
                description: 'Adds +1 Defender Bonus to the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 200,
                baseCostCreditsSpecialists: 2,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        defenderBonus: 1
                    }
                }
            },
            {
                id: 5,
                key: 'habitat-dome',
                name: 'Warp Scrambler',
                description: 'Locks the Warp Gate at the star to prevent non-allied players from using it. Deducts -1 Weapons from your side in combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        weapons: -1
                    },
                    special: {
                        lockWarpGates: true
                    }
                }
            },
            {
                id: 6,
                key: 'techno-heart',
                name: 'World Builder',
                description: 'Adds +1 to the star\'s natural resources every tick. Deducts -5 Weapons from your side in combat and -3 Scanning from the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 1000,
                baseCostCreditsSpecialists: 10,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        addNaturalResourcesOnTick: 1
                    },
                    local: {
                        scanning: -3,
                        weapons: -5
                    }
                }
            },
            {
                id: 7,
                key: 'missile-pod',
                name: 'War Machine',
                description: 'Adds +5 Weapons to your side in combat and +5 Manufacturing to the star. Deducts -1 from the star\'s natural resources every tick, when the star reaches 0 natural resources, the star dies and the specialist retires.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: true,
                expireTicks: null,
                modifiers: {
                    special: {
                        addNaturalResourcesOnTick: -1
                    },
                    local: {
                        manufacturing: 5,
                        weapons: 5
                    }
                }
            },
            {
                id: 8,
                key: 'power-generator',
                name: 'Scrambler',
                description: 'Prevents other players from seeing how many ships are garrisoned at the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        hideShips: true
                    }
                }
            },
            {
                id: 9,
                key: 'space-suit',
                name: 'Demolition Controller',
                description: 'If the star is captured, all infrastructure is destroyed.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        destroyInfrastructureOnLoss: true
                    }
                }
            },
            {
                id: 10,
                key: 'ringed-planet',
                name: 'Trade Port',
                description: 'The star\'s economic infrastructure contributes x2 to economy production and adds +1 Scanning to the star. Deducts -3 Weapons from your side in combat and -5 Terraforming from the star. This star becomes visible to all players in the galaxy.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 1000,
                baseCostCreditsSpecialists: 10,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        terraforming: -5,
                        weapons: -3,
                        scanning: 1
                    },
                    special: {
                        economyInfrastructureMultiplier: 2
                    }
                }
            },
            {
                id: 11,
                key: 'observatory',
                name: 'Research Station',
                description: 'The star\'s scientific infrastructure contributes x2 to research and adds +1 Scanning to the star. Deducts -3 Weapons from your side in combat and -3 Terraforming from the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        terraforming: -3,
                        weapons: -3,
                        scanning: 1
                    },
                    special: {
                        scienceInfrastructureMultiplier: 2
                    }
                }
            },
            {
                id: 12,
                key: 'double-ringed-orb',
                name: 'Financial Analyst',
                description: 'The star produces +2 credits per tick for each point of science on the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 1000,
                baseCostCreditsSpecialists: 10,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        creditsPerTickByScience: 2
                    }
                }
            },
            {
                id: 13,
                key: 'radar-dish',
                name: 'Telescope Array',
                description: 'Adds +3 Scanning Range to the star. Deducts -3 Weapons from your side in combat.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 600,
                baseCostCreditsSpecialists: 6,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        scanning: 3,
                        weapons: -3
                    }
                }
            },
            {
                id: 14,
                key: 'energy-tank',
                name: 'Mineral Extractor',
                description: 'Adds +2 Terraforming to the star.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 100,
                baseCostCreditsSpecialists: 1,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    local: {
                        terraforming: 2
                    }
                }
            },
            {
                id: 15,
                key: 'cryo-chamber',
                name: 'Cryo Chamber',
                description: 'When a carrier is built at this star, a General carrier specialist is automatically assigned to the carrier.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 1500,
                baseCostCreditsSpecialists: 15,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        autoCarrierSpecialistAssign: 4
                    }
                }
            },
            {
                id: 16,
                key: 'rocket-thruster',
                name: 'Stellar Engine',
                description: 'When the Stellar Engine is activated, the star slowly moves towards the nearest Stellar Beacon at x0.25 carrier speed.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 500,
                baseCostCreditsSpecialists: 5,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        moveStar: true,
                        starMovementPerTick: 0.25
                    }
                }
            },
            {
                id: 17,
                key: 'targeting',
                name: 'Stellar Beacon',
                description: 'The Stellar Beacon helps nearby Stellar Engines navigate, a Stellar Engine moves towards the nearest Stellar Beacon.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 300,
                baseCostCreditsSpecialists: 3,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        attractStar: true
                    }
                }
            },
            {
                id: 18,
                key: 'star-gate',
                name: 'Stargate',
                description: 'This star will form a wormhole with the next star where a Stargate is hired and the specialist will retire.',
                active: {
                    official: true,
                    custom: true
                },
                baseCostCredits: 2500,
                baseCostCreditsSpecialists: 25,
                oneShot: false,
                expireTicks: null,
                modifiers: {
                    special: {
                        wormHoleConstructor: true
                    }
                }
            }
        ] as Specialist[]
    }),
    getters: {
        getCarrierSpecialists: (state) => state.carrier,
        getStarSpecialists: (state) => state.star
    },
    actions: {
        getCarrierSpecialistById(id: number) {
            const carrierSpecialists = this.$state.carrier.filter((c) => c.id === id);
            return carrierSpecialists.find((c) => c.id === id);
        },
        getStarSpecialistById(id: number) {
            const starSpecialists = this.$state.star.filter((s) => s.id === id);
            return starSpecialists.find((c) => c.id === id);
        },
        getValidStarSpecialists() {
            return this.$state.star.filter((s) => s.active.custom === true);
        },
        getValidCarrierSpecialists() {
            return this.$state.carrier.filter((c) => c.active.custom === true);
        }
    }
});